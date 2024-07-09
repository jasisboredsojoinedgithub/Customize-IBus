/**
 * Prefs Library
 *
 * @author Hollowman <hollowman@opensuse.org>
 * @copyright 2020-2024
 * 
 */


export class Prefs {
    #shellVersion = null;
    #prefsKeys = null;
    #builder = null;
    #settings = null;
    #gdk = null;
    #profiles = [
        'default',
        'minimal',
        'superminimal',
    ];

    constructor(dependencies, prefsKeys, shellVersion) {
        this.#settings = dependencies['Settings'] || null;
        this.#builder = dependencies['Builder'] || null;
        this.#gdk = dependencies['Gdk'] || null;
        this.#prefsKeys = prefsKeys;
        this.#shellVersion = shellVersion;
    }

    fillPrefsWindow(window, UIFolderPath, gettextDomain) {
        let uiFilenames = [
            'general',
            'tray',
            'indicator',
            'theme',
            'background',
            'settings',
            'about'
        ];
    
        this.#builder.set_translation_domain(gettextDomain);
        for (let uiFilename of uiFilenames) {
            try {
                console.debug(`Loading UI file: ${UIFolderPath}/adw/${uiFilename}.ui`);
                this.#builder.add_from_file(`${UIFolderPath}/adw/${uiFilename}.ui`);
            } catch (error) {
                console.error(`Failed to load UI file: ${UIFolderPath}/adw/${uiFilename}.ui`, error);
            }
        }
    
        for (let uiFilename of uiFilenames) {
            try {
                let page = this.#builder.get_object(uiFilename);
                if (page) {
                    window.add(page);
                } else {
                    console.error(`UI object for ${uiFilename} not found in the loaded builder.`);
                }
            } catch (error) {
                console.error(`Failed to get UI object for: ${uiFilename}`, error);
            }
        }
    
        this.#setValues();
        this.#guessProfile();
        this.#onlyShowSupportedRows();
        this.#registerAllSignals(window);
    
        this.#setWindowSize(window);
    
        window.search_enabled = true;
    }
    

    #setWindowSize(window) {
        let [pmWidth, pmHeight, pmScale] = this.#getPrimaryMonitorInfo();
        let sizeTolerance = 50;
        let width = 600;
        let height = 650;

        if ((pmWidth / pmScale) - sizeTolerance >= width &&
            (pmHeight / pmScale) - sizeTolerance >= height) {
            window.set_default_size(width, height);
        }
    }

    #getPrimaryMonitorInfo() {
        let display = this.#gdk.Display.get_default();
        let pm = display.get_monitors().get_item(0);

        if (!pm) {
            return [700, 500, 1];
        }

        let geo = pm.get_geometry();
        let scale = pm.get_scale_factor();

        return [geo.width, geo.height, scale];
    }

    #registerAllSignals(window) {
        this.#registerKeySignals();
        this.#registerProfileSignals();
    }

    #registerKeySignals() {
        for (let [_, key] of Object.entries(this.#prefsKeys.keys)) {
            let widgetId = key.widgetId;
            let widget = this.#builder.get_object(widgetId);
    
            if (!widget) {
                console.error(`Widget with ID ${widgetId} not found for widgetType ${key.widgetType}.`);
                continue;  
            }
    
            switch (key.widgetType) {
                case 'AdwComboRow':
                    widget.connect('notify::selected-item', (w) => {
                        let index = w.get_selected();
                        let value = (index in key.maps) ? key.maps[index] : index;
                        this.#settings.set_int(key.name, value);
                        this.#guessProfile();
                    });
                    break;
                case 'AdwSwitchRow':
                    widget.connect('notify::active', (w) => {  // Change to notify::active
                        this.#settings.set_boolean(key.name, w.get_active());
                        this.#guessProfile();
                    });
                    break;
                case 'AdwSlider':
                    widget.connect('notify::value', (w) => {
                        this.#settings.set_int(key.name, w.get_value());
                        this.#guessProfile();
                    });
                    break;
                case 'AdwPreferencesRow':
                    let fontButton = this.#builder.get_object('custom_font_button');
                    if (fontButton) {
                        fontButton.connect('font-set', (w) => {
                            this.#settings.set_string(key.name, w.get_font());
                        });
                    } else {
                        console.error('Font button with ID custom_font_button not found.');
                    }
                    break;
                case 'AdwActionRow':
                    let scale = this.#builder.get_object('candidate_box_opacity_scale');
                    if (scale) {
                        scale.connect('value-changed', (w) => {
                            this.#settings.set_int(key.name, w.get_value());
                        });
                    } else {
                        console.error('Scale with ID candidate_box_opacity_scale not found.');
                    }
                    break;
                default:
                    console.error(`Unhandled widgetType ${key.widgetType} for widgetId ${widgetId}.`);
                    break;
            }
        }
    }
    
    

    #registerProfileSignals() {
        for (let profile of this.#profiles) {
            let widget = this.#builder.get_object(`profile_${profile}`);
            if (!widget) {
                break;
            }
            widget.connect('clicked', (w) => {
                this.#setValues(profile);
            });
        }
    }

    #guessProfile() {
        let totalCount = 0;
        let matchCount = {};
    
        for (let profile of this.#profiles) {
            matchCount[profile] = 0;
        }
    
        for (let [_, key] of Object.entries(this.#prefsKeys.keys)) {
            if (!key.supported) {
                continue;
            }
    
            let value;
    
            try {
                switch (key.widgetType) {
                    case 'AdwSwitchRow':
                        value = this.#builder.get_object(key.widgetId)?.get_active();
                        break;
                    case 'AdwComboRow':
                        value = this.#builder.get_object(key.widgetId)?.get_selected();
                        break;
                    case 'AdwSlider':
                        value = this.#builder.get_object(key.widgetId)?.get_value();
                        break;
                    case 'GtkCheckButton':
                        value = this.#builder.get_object(key.widgetId)?.get_active();
                        break;
                    case 'GtkScale':
                        value = this.#builder.get_object(key.widgetId)?.get_value();
                        break;
                    case 'GtkFontButton':
                        value = this.#builder.get_object(key.widgetId)?.get_font();
                        break;
                    default:
                        value = '';
                        continue;
                }
            } catch (error) {
                console.error(`Error getting object for widget ID ${key.widgetId}:`, error);
                value = '';  // Set a default value in case of error
            }
    
            for (let profile of this.#profiles) {
                if (key.profiles[profile] === value) {
                    matchCount[profile]++;
                }
            }
    
            totalCount++;
        }
    
        // Additional logging to verify matchCount
        console.debug(`Match count:`, matchCount);
    
        let currentProfile = 'custom';
        for (let profile of this.#profiles) {
            if (matchCount[profile] === totalCount) {
                currentProfile = profile;
                break;
            }
        }
    
        let widget = this.#builder.get_object(`profile_${currentProfile}`);
        if (widget) {
            widget.set_active(true);
        } else {
            console.error(`Profile widget for ${currentProfile} not found.`);
        }
    }
    

    #setValues(profile) {
        for (let [, key] of Object.entries(this.#prefsKeys.keys)) {
            let widget = this.#builder.get_object(key.widgetId);
            if (!widget) {
                console.error(`Widget with ID ${key.widgetId} not found`);
                continue;
            }

            switch (key.widgetType) {
                case 'AdwSwitchRow':
                    let value = (profile) ? key.profiles[profile] : this.#settings.get_boolean(key.name);
                    widget.set_active(value);
                    break;

                case 'AdwComboRow':
                    let index = (profile) ? key.profiles[profile] : this.#settings.get_int(key.name);
                    for (let k in key.maps) {
                        if (key.maps[k] === index) {
                            index = k;
                            break;
                        }
                    }
                    widget.set_selected(index);
                    break;

                case 'AdwSlider':
                    let sliderValue = (profile) ? key.profiles[profile] : this.#settings.get_int(key.name);
                    widget.set_value(sliderValue);
                    break;

                case 'GtkCheckButton':
                    let checkValue = (profile) ? key.profiles[profile] : this.#settings.get_boolean(key.name);
                    widget.set_active(checkValue);
                    let targetWidget = this.#builder.get_object(`${key.widgetId}_target`);
                    if (targetWidget) {
                        targetWidget.set_sensitive(checkValue);
                    }
                    break;

                case 'GtkComboBoxText':
                    let comboValue = (profile) ? key.profiles[profile] : this.#settings.get_string(key.name);
                    widget.set_active_id(comboValue);
                    break;
            }
        }
    }

    #onlyShowSupportedRows() {
        for (let [_, key] of Object.entries(this.#prefsKeys.keys)) {
            let widgetId = `${key.id}_row`;
            
            if (key.widgetType === 'GtkCheckButton' || key.widgetType === 'GtkScale' || key.widgetType === 'GtkFontButton') {
                widgetId = key.widgetId;  // Use the widgetId directly for these types
            }
    
            let row = this.#builder.get_object(widgetId);
    
            if (!row) {
                console.error(`Row with ID ${widgetId} not found.`);
                continue;  
            }
    
            let visible = key.supported;
            row.visible = visible;
        }
    }
    
}






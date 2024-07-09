/**
 * Manager Library
 *
 * 
 */

/**
 * Apply settings to the GNOME Shell
 */
export class Manager
{
    /**
     * Current shell version
     *
     * @type {number|null}
     */
    #shellVersion = null;

    /**
     * Instance of API
     *
     * @type {API|null}
     */
    #api = null;

    /**
     * Instance of Gio.Settings
     *
     * @type {Settings|null}
     */
    #settings = null;

    /**
     * Class Constructor
     *
     * @param {Object} dependencies
     *   'API' instance of lib::API
     *   'Settings' instance of Gio::Settings
     * @param {number} shellVersion float in major.minor format
     */
    constructor(dependencies, shellVersion)
    {
        this.#api = dependencies['API'] || null;
        this.#settings = dependencies['Settings'] || null;
        this.#shellVersion = shellVersion;
    }

    /**
     * register all signals for settings
     *
     * @returns {void}
     */
    registerSettingsSignals() {
        this.#settings.connect('changed::enable-auto-switch', () => {
            this.#applyAutoSwitch();
        });

        this.#settings.connect('changed::enable-custom-theme', () => {
            this.#applyCustomTheme();
        });

        this.#settings.connect('changed::enable-custom-theme-dark', () => {
            this.#applyCustomThemeDark();
        });

        this.#settings.connect('changed::use-candidate-opacity', () => {
            this.#applyCandidateOpacity();
        });

        this.#settings.connect('changed::use-indicator-opacity', () => {
            this.#applyIndicatorOpacity();
        });

        this.#settings.connect('changed::use-custom-bg', () => {
            this.#applyCustomBg();
        });

        this.#settings.connect('changed::use-custom-bg-dark', () => {
            this.#applyCustomBgDark();
        });

        this.#settings.connect('changed::enable-orientation', () => {
            this.#applyOrientation();
        });

        this.#settings.connect('changed::candidate-orientation', () => {
            this.#applyCandidateOrientation();
        });

        this.#settings.connect('changed::custom-font', () => {
            this.#applyCustomFont();
        });

        this.#settings.connect('changed::ascii-mode', () => {
            this.#applyAsciiMode();
        });

        this.#settings.connect('changed::unkown-ascii-state', () => {
            this.#applyUnknownAsciiState();
        });

        this.#settings.connect('changed::input-mode-list', () => {
            this.#applyInputModeList();
        });

        this.#settings.connect('changed::custom-theme', () => {
            this.#applyCustomThemePath();
        });

        this.#settings.connect('changed::custom-theme-dark', () => {
            this.#applyCustomThemeDarkPath();
        });

        this.#settings.connect('changed::custom-bg', () => {
            this.#applyCustomBgPath();
        });

        this.#settings.connect('changed::custom-bg-dark', () => {
            this.#applyCustomBgDarkPath();
        });

        this.#settings.connect('changed::input-mode-remember', () => {
            this.#applyInputModeRemember();
        });

        this.#settings.connect('changed::candidate-scroll-mode', () => {
            this.#applyCandidateScrollMode();
        });

        this.#settings.connect('changed::menu-ibus-emoji', () => {
            this.#applyMenuIbusEmoji();
        });

        this.#settings.connect('changed::menu-extension-preference', () => {
            this.#applyMenuExtensionPreference();
        });

        this.#settings.connect('changed::menu-ibus-preference', () => {
            this.#applyMenuIbusPreference();
        });

        this.#settings.connect('changed::menu-ibus-version', () => {
            this.#applyMenuIbusVersion();
        });

        this.#settings.connect('changed::menu-ibus-restart', () => {
            this.#applyMenuIbusRestart();
        });

        this.#settings.connect('changed::menu-ibus-exit', () => {
            this.#applyMenuIbusExit();
        });

        this.#settings.connect('changed::use-input-indicator', () => {
            this.#applyInputIndicator();
        });

        this.#settings.connect('changed::input-indicator-only-on-toggle', () => {
            this.#applyInputIndicatorOnlyOnToggle();
        });

        this.#settings.connect('changed::input-indicator-only-use-ascii', () => {
            this.#applyInputIndicatorOnlyUseAscii();
        });

        this.#settings.connect('changed::input-indicator-not-on-single-ime', () => {
            this.#applyInputIndicatorNotOnSingleIme();
        });

        this.#settings.connect('changed::input-indicator-use-scroll', () => {
            this.#applyInputIndicatorUseScroll();
        });

        this.#settings.connect('changed::input-indicator-animation', () => {
            this.#applyInputIndicatorAnimation();
        });

        this.#settings.connect('changed::use-indicator-show-delay', () => {
            this.#applyIndicatorShowDelay();
        });

        this.#settings.connect('changed::input-indicator-show-time', () => {
            this.#applyInputIndicatorShowTime();
        });

        this.#settings.connect('changed::use-indicator-auto-hide', () => {
            this.#applyIndicatorAutoHide();
        });

        this.#settings.connect('changed::input-indicator-hide-time', () => {
            this.#applyInputIndicatorHideTime();
        });

        this.#settings.connect('changed::use-popup-animation', () => {
            this.#applyPopupAnimation();
        });

        this.#settings.connect('changed::candidate-popup-animation', () => {
            this.#applyCandidatePopupAnimation();
        });

        this.#settings.connect('changed::use-candidate-reposition', () => {
            this.#applyCandidateReposition();
        });

        this.#settings.connect('changed::fix-ime-list', () => {
            this.#applyFixImeList();
        });

        this.#settings.connect('changed::use-indicator-left-click', () => {
            this.#applyIndicatorLeftClick();
        });

        this.#settings.connect('changed::indicator-left-click-func', () => {
            this.#applyIndicatorLeftClickFunc();
        });

        this.#settings.connect('changed::input-indicator-right-close', () => {
            this.#applyIndicatorRightClickClose();
        });

        this.#settings.connect('changed::use-indicator-custom-font', () => {
            this.#applyIndicatorCustomFont();
        });

        this.#settings.connect('changed::indicator-custom-font', () => {
            this.#applyIndicatorCustomFontValue();
        });

        this.#settings.connect('changed::use-tray', () => {
            this.#applyTrayIcon();
        });

        this.#settings.connect('changed::use-tray-click-source-switch', () => {
            this.#applyTrayClickSourceSwitch();
        });

        this.#settings.connect('changed::tray-source-switch-click-key', () => {
            this.#applyTraySourceSwitchClickKey();
        });

        this.#settings.connect('changed::use-candidate-box-right-click', () => {
            this.#applyCandidateBoxRightClick();
        });

        this.#settings.connect('changed::candidate-box-right-click-func', () => {
            this.#applyCandidateBoxRightClickFunc();
        });

        this.#settings.connect('changed::use-candidate-still', () => {
            this.#applyCandidateStill();
        });

        this.#settings.connect('changed::candidate-still-position', () => {
            this.#applyCandidateStillPosition();
        });

        this.#settings.connect('changed::remember-candidate-position', () => {
            this.#applyRememberCandidatePosition();
        });

        this.#settings.connect('changed::candidate-box-position', () => {
            this.#applyCandidateBoxPosition();
        });
    }
    

     /**
     * apply everything to the GNOME Shell
     *
     * @returns {void}
     */

    
    
 
     /**
      * revert everything done by this class to the GNOME Shell
      *
      * @returns {void}
      */
    

     #applyAutoSwitch(revert = false) {
    }

    #applyCustomTheme(revert = false) {
    }

    #applyCustomThemeDark(revert = false) {
    }

    #applyCandidateOpacity(revert = false) {
    }

    #applyIndicatorOpacity(revert = false) {
    }

    #applyCustomBg(revert = false) {
    }

    #applyCustomBgDark(revert = false) {
    }

    #applyOrientation(revert = false) {
    }

    #applyCandidateOrientation(revert = false) {
    }

    #applyCustomFont(revert = false) {
    }

    #applyAsciiMode(revert = false) {
    }

    #applyUnknownAsciiState(revert = false) {
    }

    #applyInputModeList(revert = false) {
    }

    #applyCustomThemePath(revert = false) {
    }

    #applyCustomThemeDarkPath(revert = false) {
    }

    #applyCustomBgPath(revert = false) {
    }

    #applyCustomBgDarkPath(revert = false) {
    }

    #applyInputModeRemember(revert = false) {
    }

    #applyCandidateScrollMode(revert = false) {
    }

    #applyMenuIbusEmoji(revert = false) {
    }

    #applyMenuExtensionPreference(revert = false) {
    }

    #applyMenuIbusPreference(revert = false) {
    }

    #applyMenuIbusVersion(revert = false) {
    }

    #applyMenuIbusRestart(revert = false) {
    }

    #applyMenuIbusExit(revert = false) {
    }

    #applyInputIndicator(revert = false) {
    }

    #applyInputIndicatorOnlyOnToggle(revert = false) {
    }

    #applyInputIndicatorOnlyUseAscii(revert = false) {
    }

    #applyInputIndicatorNotOnSingleIme(revert = false) {
    }

    #applyInputIndicatorUseScroll(revert = false) {
    }

    #applyInputIndicatorAnimation(revert = false) {
    }

    #applyIndicatorShowDelay(revert = false) {
    }

    #applyInputIndicatorShowTime(revert = false) {
    }

    #applyIndicatorAutoHide(revert = false) {
    }

    #applyInputIndicatorHideTime(revert = false) {
    }

    #applyPopupAnimation(revert = false) {
    }

    #applyCandidatePopupAnimation(revert = false) {
    }

    #applyCandidateReposition(revert = false) {
    }

    #applyFixImeList(revert = false) {
    }

    #applyIndicatorLeftClick(revert = false) {
    }

    #applyIndicatorLeftClickFunc(revert = false) {
    }

    #applyIndicatorRightClickClose(revert = false) {
    }

    #applyIndicatorCustomFont(revert = false) {
    }

    #applyIndicatorCustomFontValue(revert = false) {
    }

    #applyTrayIcon(revert = false) {
    }

    #applyTrayClickSourceSwitch(revert = false) {
    }

    #applyTraySourceSwitchClickKey(revert = false) {
    }

    #applyCandidateBoxRightClick(revert = false) {
    }

    #applyCandidateBoxRightClickFunc(revert = false) {
    }

    #applyCandidateStill(revert = false) {
    }

    #applyCandidateStillPosition(revert = false) {
    }

    #applyRememberCandidatePosition(revert = false) {
    }

    #applyCandidateBoxPosition(revert = false) {
    }
}
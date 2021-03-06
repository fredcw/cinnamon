// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

const Lang = imports.lang;
const Cinnamon = imports.gi.Cinnamon;

const Main = imports.ui.main;
const MessageTray = imports.ui.messageTray;

function WindowAttentionHandler() {
    this._init();
}

WindowAttentionHandler.prototype = {
    _init : function() {
        this._tracker = Cinnamon.WindowTracker.get_default();
        global.display.connect('window-demands-attention', Lang.bind(this, this._onWindowDemandsAttention));
    },

    _onWindowDemandsAttention : function(display, window) {
        /* Ordinarily, new windows that don't specifically demand focus (like ones created
         * without user interaction) only get some indicator that the window wants the
         * user's attention (like blinking in the window list). Some windows aren't
         * directly tied to a user action, but are generated by the user's action anyhow -
         * these we make an exception for and focus them. */
        try {
            if (!window || window.has_focus() || window.is_skip_taskbar() || !window.is_interesting()) {
                return;
            }

            let wmclass = window.get_wm_class();

            if (wmclass) {
                let ignored_classes = global.settings.get_strv("demands-attention-passthru-wm-classes");

                for (let i = 0; i < ignored_classes.length; i++) {
                    if (wmclass.toLowerCase().includes(ignored_classes[i].toLowerCase())) {
                        window.activate(global.get_current_time());
                        break;
                    }
                }
            }
        } catch (e) {
            global.logError('Error showing window demanding attention', e);
        }
    }
};

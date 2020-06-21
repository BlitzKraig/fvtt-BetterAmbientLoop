Hooks.on("createAmbientSound", async (scene, ambientAudio) => {
    if (!game.settings.get("BetterAmbientLoop", "enabled")) {
        return;
    }
    setTimeout(() => {
        BetterAmbientLoop.updateSingleAmbientSoundOffset(ambientAudio._id);
        console.log("BetterAmbientLoop New sound configured");
    }, game.settings.get("BetterAmbientLoop", "newAudioTimeout"));

});

Hooks.on("updateAmbientSound", async (scene, ambientAudio, changes) => {

    if (!game.settings.get("BetterAmbientLoop", "enabled")) {
        return;
    }
    if (changes.path) {
        setTimeout(() => {
            BetterAmbientLoop.updateSingleAmbientSoundOffset(ambientAudio._id);
            console.log("BetterAmbientLoop Sound updated");
        }, game.settings.get("BetterAmbientLoop", "newAudioTimeout"));
    }
});

Hooks.on("init", () => {
    game.settings.register("BetterAmbientLoop", "enabled", {
        name: "Enable/disable Better Ambient Loop",
        hint: "Uncheck to disable Better Ambient Loop (Per player)",
        scope: "client",
        config: true,
        default: true,
        type: Boolean,
        onChange: value => {
            if (value) {
                BetterAmbientLoop.hasShownError = false;
                BetterAmbientLoop.updateAllAmbientSoundOffsets(game.settings.get("BetterAmbientLoop", "offset"));
            } else {
                BetterAmbientLoop.updateAllAmbientSoundOffsets(0);
            }
        }
    });
    game.settings.register("BetterAmbientLoop", "offset", {
        name: "Audio sprite end offset",
        hint: "Tweak the 'end sprite' offset (Per player). See https://github.com/BlitzKraig/fvtt-BetterAmbientLoop/README.md for help",
        scope: "client",
        config: true,
        type: Number,
        range: {
            min: -1000,
            max: 0,
            step: 10
        },
        default: -200,
        onChange: value => {
            if (game.settings.get("BetterAmbientLoop", "enabled")) {
                BetterAmbientLoop.hasShownError = false;
                BetterAmbientLoop.updateAllAmbientSoundOffsets(value);
            }
        }
    });
    game.settings.register("BetterAmbientLoop", "startupTimeout", {
        name: "Timeout before starting",
        hint: "Since there's no hook for us to grab, we need to wait a short time after canvasReady before trying to update sounds. If you have a large scene and notice Better Ambient Loop isn't working, or you're getting errors, try increasing this timeout and refreshing.",
        scope: "client",
        config: true,
        type: Number,
        range: {
            min: 200,
            max: 10000,
            step: 10
        },
        default: 2000
    });
    game.settings.register("BetterAmbientLoop", "newAudioTimeout", {
        name: "Timeout after creating/updating ambient sound",
        hint: "Similar to above, but the timeout after creating a sound or changing the sound file. You probably shouldn't ever need to change this, but if you're getting errors after creating a sound then try increasing this",
        scope: "client",
        config: true,
        type: Number,
        range: {
            min: 200,
            max: 5000,
            step: 10
        },
        default: 200
    });
    game.settings.register("BetterAmbientLoop", "hasShownNonChromeMessage", {
        name: "NonChrome Message Shown",
        scope: "client",
        config: false,
        default: false,
        type: Boolean
    });
});

Hooks.on("canvasReady", (canvas) => {
    if (!game.settings.get("BetterAmbientLoop", "hasShownNonChromeMessage") && navigator.userAgent.indexOf('Chrome') < 0) {
        game.settings.set("BetterAmbientLoop", "hasShownNonChromeMessage", true);
        new Dialog({
            title: "Better Ambient Loop - Browser Compatibility",
            content: "<p>Better Ambient Loop works best in Chrome.</p><p>Firefox will always have a slight clip of silence, and other browsers have not been tested</p><p>You will only see this message once. Please consider using Chrome.</p>",
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Ok"
                }
            },
            default: "ok"
        }).render(true);
    }
    if (game.settings.get("BetterAmbientLoop", "enabled")) {
        setTimeout(() => BetterAmbientLoop.updateAllAmbientSoundOffsets(game.settings.get("BetterAmbientLoop", "offset")), game.settings.get("BetterAmbientLoop", "startupTimeout") || 500);
    }
});

const logOffsetTooLow = (msg) => {
    console.log(`Better Ambient Loop: ${msg}`);

    if (!BetterAmbientLoop.hasShownError) {
        ui.notifications.error("Better Ambient Loop: Offset is too low for one or more sounds. These sounds have been reset. Please tweak your offset in the module settings.")
        BetterAmbientLoop.hasShownError = true;
    }
}

class BetterAmbientLoop {

    static hasShownError = false;

    static async updateAllAmbientSoundOffsets(offsetValue) {
        canvas.sounds.objects.children.forEach(ambientSound => {
            if (ambientSound.howl._sprite.__betterasoriginal) {
                if (ambientSound.howl._sprite.__betterasoriginal[1] + offsetValue > 0) {
                    ambientSound.howl._sprite.__default[1] = ambientSound.howl._sprite.__betterasoriginal[1] + offsetValue;
                } else {
                    logOffsetTooLow(`Offset too low for sound ${ambientSound.data._id}, reverting to original`);
                    ambientSound.howl._sprite.__default[1] = ambientSound.howl._sprite.__betterasoriginal[1];
                }
            } else {
                if (ambientSound.howl._sprite.__default[1] + offsetValue > 0) {
                    ambientSound.howl._sprite.__betterasoriginal = JSON.parse(JSON.stringify(ambientSound.howl._sprite.__default));
                    ambientSound.howl._sprite.__default[1] += offsetValue;
                } else {
                    logOffsetTooLow(`Offset too low for sound ${ambientSound.data._id}, skipping as not yet set`);
                }
            }
        });
    }

    static async updateSingleAmbientSoundOffset(ambientSoundID) {
        if (canvas.sounds.get(ambientSoundID).howl._sprite.__default[1] += game.settings.get("BetterAmbientLoop", "offset") < 0) {
            canvas.sounds.get(ambientSoundID).howl._sprite.__betterasoriginal = JSON.parse(JSON.stringify(canvas.sounds.get(ambientSoundID).howl._sprite.__default));
            canvas.sounds.get(ambientSoundID).howl._sprite.__default[1] += game.settings.get("BetterAmbientLoop", "offset");
        } else {
            logOffsetTooLow(`Offset too low for sound ${ambientSoundID}, skipping as not yet set`);
        }
    }
}
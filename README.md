# Better Ambient Loop

Per-client Ambient Sound improvement, allowing for looping without cuts.

The default Ambient Sounds implementation has some silence between the end of the track and the beginning of the loop. This is a limitation of howler.js, and may only affect some clients.

Using this module, the silence can be eliminated for much better sounding loops.

The default offset of -200 will likely be fine for most use cases. A campfire sound for example will work great, as the end and start of the loop do not need to be 'perfect'.
However, if you are not satisfied with this offset, each client can modify it for themselves.
Please see the video below on how to zero in on the correct offset for your client.

The testsounds are only to help with configuration changes. Once your config is changed, all of your ambientsounds, including ones already placed, should use the new offset, hopefully without the need for a refresh.

[![Better Ambient Loop configuration tutorial](https://img.youtube.com/vi/5d1RPn9qu3s/0.jpg)](https://www.youtube.com/watch?v=5d1RPn9qu3s)

## Basic configuration

If the default offset isn't quite doing it for you, you can configure it yourself with the help of some testsounds.

`noise.ogg` is just 1 second of noise. Useful for checking if the cut is eliminated.

`beeptest.ogg` has two short tones at different pitches at the start and end of the track, and white noise throughout. If you can hear both tones, and the white noise never stops, you should have a fairly solid offset.

1. Create a new Ambient Sound, using one of the test sounds found in modules/BetterAmbientLoop/helpersounds/
2. Place a token within the sounds boundary
3. Select the token to hear the sound
4. Open your module settings > Better Ambient Loop
5. Tweak the `Audio sprite end offset`
6. Save
7. Repeat 4-6 until satisfied

This should be a fairly simple way to find a decent offset. Remember that each client has their own offset, so if you want to try and get things working as well as possible, it may be worth setting up a test scene with one of these sounds and running your players through the config.

This configuration should only need to be performed once. Reloading, changing scenes, shutting down foundry etc. will carry your offset over.

If a player does not experience any silence in Ambient Sounds normally, they can disable Better Ambient Loop from the modules settings.

NOTE: This is not a perfect solution, due to the way howler.js works. If your offset is _just_ hitting the end of the track, it may have a slight clip of silence every now and then. The 'safest' method is to give yourself a small buffer, if that's possible for your use-case.

---

## Troubleshooting

If Better Ambient Loop doesn't seem to be doing anything, try increasing your `Timeout before starting` (v1.1+) in the module settings and refreshing.

Since we are unable to tell when the ambient audio is ready, a timeout after `canvasReady` is the simplest workaround I could find.

## Manifest

`https://raw.githubusercontent.com/BlitzKraig/fvtt-BetterAmbientLoop/master/module.json`

## Feedback

For bugs/feedback, create an issue on GitHub, or contact me on Discord at Blitz#6797

## [Release Notes](./CHANGELOG.md)

import type { PresetGroup, PresetPack } from "./action-presets";

/**
 * Named transition prompts for the flow app (see e-dream-ai/frontend#722).
 *
 * Each pack holds a single action so it surfaces as one entry in the flow
 * Preset dropdown — picking it fills the prompt (and negative prompt, where
 * the transition calls for one). No LoRAs: these are prompt-only recipes and
 * therefore work with every video model, so every pack is `model: "all"`.
 *
 * Array order is menu order within each group: the transformations come
 * first, then the camera moves.
 */

const CONTINUITY_NEGATIVE =
  "hard cut, flicker, popping, discontinuous motion, extra limbs, unnatural physics";

const DISSOLVE_NEGATIVE =
  "hard cut, popping, sudden appearance, flicker, discontinuous reformation";

const PATTERN_NEGATIVE = "hard cut, flicker, popping, abrupt pattern change";

const transitionPack = (
  group: PresetGroup,
  name: string,
  prompt: string,
  negativePrompt?: string,
): PresetPack => ({
  name,
  model: "all",
  group,
  actions: [{ prompt, enabled: true, negativePrompt }],
});

export const TRANSITION_PRESETS: PresetPack[] = [
  transitionPack(
    "transformations",
    "Morph",
    "The subject undergoes a continuous liquid transformation, the surface ripples and reshapes fluidly, edges and forms stretch and reform gradually, the transformation reads as one unbroken physical process, camera holds static or performs a slow orbit throughout.",
    CONTINUITY_NEGATIVE,
  ),
  transitionPack(
    "transformations",
    "Kaleidoscope",
    "The frame fractures into a symmetrical kaleidoscopic pattern, repeating fractal segments rotate and multiply across the frame, the pattern gradually collapses and reconverges into a single coherent image, one continuous unbroken transformation.",
    PATTERN_NEGATIVE,
  ),
  transitionPack(
    "transformations",
    "Liquid",
    "The subject dissolves into a fluid medium such as drifting particles, smoke, water, or light, the particles swirl and drift across the frame, then reconverge and reform continuously into the following scene, one continuous simulation with no gap, camera static or slow drift.",
    DISSOLVE_NEGATIVE,
  ),
  transitionPack(
    "transformations",
    "Time-Lapse",
    "The framing remains largely static while the environment transitions continuously, light, color temperature, and atmosphere shift gradually and naturally across the duration, time-lapse pacing throughout.",
  ),
  transitionPack(
    "transformations",
    "Match Cut",
    "A central shape or silhouette holds its exact position and outline in frame while its surface, color, and material shift and transform continuously, the background transforms in sync with it, camera holds static or performs a slow push-in throughout.",
  ),
  transitionPack(
    "camera",
    "Zoom-Through",
    "Camera performs a rapid crash zoom into a central point of the frame, the zoomed detail fills the entire frame, motion accelerates smoothly and carries directly into the following scene, one unbroken continuous zoom, tracking shot, cinematic pacing.",
  ),
  transitionPack(
    "camera",
    "Pull-Back Reveal",
    "Camera begins in extreme close-up and pulls back smoothly at a constant rate, the frame gradually widens second by second until the full scene is revealed, no jump in scale, slow steady pull-out throughout.",
  ),
  transitionPack(
    "camera",
    "Dolly Zoom",
    "Camera dollies forward while the lens zoom compensates in the opposite direction, the background stretches and reshapes continuously around a fixed central point, the environment transforms gradually as the dolly zoom progresses, disorienting but smooth.",
  ),
  transitionPack(
    "camera",
    "Whip Pan",
    "Camera performs a fast horizontal whip pan, motion blurs into a directional streak at the midpoint, the whip settles naturally on the other side with no overshoot, one continuous pan.",
  ),
  transitionPack(
    "camera",
    "Object Occlusion",
    "Camera tracks forward past a foreground object that gradually fills the entire frame, completely blocking the view for a moment, camera continues moving as the object clears the frame, one continuous tracking move.",
  ),
  transitionPack(
    "camera",
    "Portal / Doorway Pass-Through",
    "Camera moves forward through a threshold within the frame, continuing directly through the opening without slowing, the space beyond resolves naturally as the camera crosses through, one continuous forward motion.",
  ),
  transitionPack(
    "camera",
    "360 Rotation",
    "Camera orbits smoothly around a fixed central point in a full or partial rotation, the background transforms gradually over the course of the rotation, constant rotation speed throughout.",
  ),
  transitionPack(
    "camera",
    "Match on Action",
    "The subject performs a single continuous physical motion, such as a jump, turn, dive, or fall, the surrounding environment shifts seamlessly at the peak of the motion, camera tracks or holds the subject throughout, natural physics.",
  ),
  transitionPack(
    "camera",
    "Light Flash Whiteout",
    "A light source within the frame intensifies gradually, the screen brightens smoothly to a near white overexposure without cutting, the following scene emerges out of the light as exposure settles back to normal, one continuous exposure ramp.",
  ),
  transitionPack(
    "camera",
    "Reflection / Mirror Pass-Through",
    "Camera pushes toward a reflective surface within the frame, the reflection grows to fill the frame completely, camera continues moving through the surface, the following scene resolves naturally as if passing through the reflection, one continuous push.",
  ),
  transitionPack(
    "camera",
    "Rack Focus Reveal",
    "Camera holds a near element in sharp focus with a background element visible but soft and out of focus, focus racks smoothly from the near element to the background over the duration, camera remains static or performs a slight push.",
  ),
  transitionPack(
    "camera",
    "Pan-Across Wipe",
    "Camera pans smoothly across a large surface within the frame at a constant speed, the surface gradually shifts in character as the pan progresses, by the end of the pan the frame has resolved into the following scene.",
  ),
  transitionPack(
    "camera",
    "Parallax Push-Through",
    "Camera moves forward at speed through layered foreground elements, near layers blur past faster than distant ones creating strong parallax, the camera emerges from the layers into the following scene, one continuous forward push.",
  ),
];

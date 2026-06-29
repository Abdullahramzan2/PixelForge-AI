STYLE_SUFFIXES: dict[str, str] = {
    "luxury": "luxury aesthetic, premium lighting, high-end commercial photography, elegant",
    "minimal": "minimal clean background, soft shadows, modern product photography, simple",
    "outdoor": "natural outdoor setting, lifestyle photography, golden hour lighting",
}

SCENE_PROMPTS: dict[str, str] = {
    "luxury": "luxury studio backdrop with marble surface and soft golden lighting",
    "minimal": "clean white studio background with soft natural shadows",
    "outdoor": "beautiful outdoor lifestyle setting with natural sunlight and blurred nature background",
}

STYLE_PRESETS = [
    {"id": "luxury", "name": "Luxury", "description": "Premium, high-end aesthetic"},
    {"id": "minimal", "name": "Minimal", "description": "Clean, simple, modern look"},
    {"id": "outdoor", "name": "Outdoor", "description": "Natural, lifestyle outdoor setting"},
]


def build_styled_prompt(user_prompt: str, style: str | None) -> str:
    prompt = user_prompt.strip()
    if style and style in STYLE_SUFFIXES:
        return f"{prompt}, {STYLE_SUFFIXES[style]}"
    return prompt


def build_scene_prompt(style: str, scene_prompt: str | None = None) -> str:
    scene = SCENE_PROMPTS.get(style, "professional studio background")
    extra = scene_prompt.strip() if scene_prompt else "professional product advertisement background"
    return (
        f"{extra}, {scene}, {STYLE_SUFFIXES[style]}, "
        "empty space for product placement, background only, no product"
    )

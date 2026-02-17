/* ============================================
   NVIDIA Profile Manager Pro - Data Model
   Realistic NVIDIA profile settings database
   ============================================ */

const NVIDIA_SETTINGS = {
    rendering: {
        label: "Rendering",
        settings: [
            {
                id: "0x00A06946",
                name: "Ambient Occlusion",
                description: "Controls screen-space ambient occlusion quality. Higher quality produces more realistic shadow effects in corners and crevices but increases GPU load.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "Low" },
                    { value: 2, label: "Medium" },
                    { value: 3, label: "High" },
                    { value: 4, label: "Ultra" }
                ],
                defaultValue: 0,
                category: "rendering"
            },
            {
                id: "0x1057EB71",
                name: "Anisotropic Filtering",
                description: "Improves texture quality at oblique viewing angles. Higher values produce sharper textures at a minimal performance cost on modern GPUs.",
                type: "select",
                options: [
                    { value: 0, label: "Application Controlled" },
                    { value: 1, label: "Off" },
                    { value: 2, label: "2x" },
                    { value: 4, label: "4x" },
                    { value: 8, label: "8x" },
                    { value: 16, label: "16x" }
                ],
                defaultValue: 0,
                category: "rendering"
            },
            {
                id: "0x00664339",
                name: "Maximum Pre-Rendered Frames",
                description: "Limits the number of frames the CPU can prepare ahead of the GPU. Lower values reduce input latency but may reduce throughput.",
                type: "select",
                options: [
                    { value: 0, label: "Use Application Setting" },
                    { value: 1, label: "1" },
                    { value: 2, label: "2" },
                    { value: 3, label: "3" },
                    { value: 4, label: "4" }
                ],
                defaultValue: 0,
                category: "rendering"
            },
            {
                id: "0x00E73211",
                name: "Shader Cache Size",
                description: "Size of the on-disk shader cache. Larger caches reduce shader compilation stutters but use more disk space.",
                type: "select",
                options: [
                    { value: 0, label: "Driver Default" },
                    { value: 1, label: "Disabled" },
                    { value: 2, label: "1 GB" },
                    { value: 3, label: "5 GB" },
                    { value: 4, label: "10 GB" },
                    { value: 5, label: "Unlimited" }
                ],
                defaultValue: 0,
                category: "rendering"
            },
            {
                id: "0x209746A1",
                name: "Threaded Optimization",
                description: "Allows the driver to use multiple CPU threads for OpenGL rendering. Can improve performance in CPU-bound scenarios.",
                type: "select",
                options: [
                    { value: 0, label: "Auto" },
                    { value: 1, label: "Off" },
                    { value: 2, label: "On" }
                ],
                defaultValue: 0,
                category: "rendering"
            },
            {
                id: "0x00B56E2A",
                name: "Triple Buffering",
                description: "Enables a third back buffer for OpenGL applications. Reduces the performance impact of VSync by allowing the GPU to continue rendering while waiting for a VBlank.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" }
                ],
                defaultValue: 0,
                category: "rendering"
            },
            {
                id: "0x10F9DC81",
                name: "Texture Filtering - Quality",
                description: "Global texture filtering quality preset that affects texture sharpness and performance.",
                type: "select",
                options: [
                    { value: 0, label: "High Performance" },
                    { value: 1, label: "Performance" },
                    { value: 2, label: "Quality" },
                    { value: 3, label: "High Quality" }
                ],
                defaultValue: 2,
                category: "rendering"
            },
            {
                id: "0x007BA247",
                name: "Negative LOD Bias",
                description: "Controls whether applications can use negative LOD bias to sharpen textures. Allow may improve texture clarity but can cause shimmering.",
                type: "select",
                options: [
                    { value: 0, label: "Allow" },
                    { value: 1, label: "Clamp" }
                ],
                defaultValue: 0,
                category: "rendering"
            }
        ]
    },
    antialiasing: {
        label: "Anti-Aliasing",
        settings: [
            {
                id: "0x00741142",
                name: "Antialiasing - Mode",
                description: "Controls how anti-aliasing is applied. Override forces the driver's AA setting on all applications.",
                type: "select",
                options: [
                    { value: 0, label: "Application Controlled" },
                    { value: 1, label: "Override" },
                    { value: 2, label: "Enhance" }
                ],
                defaultValue: 0,
                category: "antialiasing"
            },
            {
                id: "0x00F1CB25",
                name: "Antialiasing - Setting",
                description: "Sets the global antialiasing level when mode is set to Override or Enhance.",
                type: "select",
                options: [
                    { value: 0, label: "None" },
                    { value: 2, label: "2x" },
                    { value: 4, label: "4x" },
                    { value: 8, label: "8x" },
                    { value: 16, label: "16x" }
                ],
                defaultValue: 0,
                category: "antialiasing"
            },
            {
                id: "0x0019BB68",
                name: "Antialiasing - Transparency",
                description: "Controls antialiasing for transparent textures (fences, foliage, etc.). Higher settings produce better quality at a performance cost.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "Multisampling" },
                    { value: 2, label: "2x Supersampling" },
                    { value: 4, label: "4x Supersampling" },
                    { value: 8, label: "8x Supersampling" }
                ],
                defaultValue: 0,
                category: "antialiasing"
            },
            {
                id: "0x00D23456",
                name: "FXAA",
                description: "Fast Approximate Anti-Aliasing. A post-processing AA technique with low performance cost. Works on any application.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" }
                ],
                defaultValue: 0,
                category: "antialiasing"
            },
            {
                id: "0x00E12AB3",
                name: "Antialiasing - Gamma Correction",
                description: "Performs anti-aliasing in linear (gamma-corrected) color space. Produces more accurate blending of colors at polygon edges.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" }
                ],
                defaultValue: 1,
                category: "antialiasing"
            },
            {
                id: "0x003CD712",
                name: "Multi-Frame Sampled AA (MFAA)",
                description: "Alternates AA sample patterns across frames to improve quality at the same performance cost. Requires MSAA to be enabled.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" }
                ],
                defaultValue: 0,
                category: "antialiasing"
            }
        ]
    },
    texture: {
        label: "Texture",
        settings: [
            {
                id: "0x00CEB891",
                name: "Texture Filtering - Anisotropic Sample Optimization",
                description: "Enables an optimization that reduces the number of anisotropic samples based on texel size. Improves performance with minimal quality impact.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" }
                ],
                defaultValue: 0,
                category: "texture"
            },
            {
                id: "0x00E88942",
                name: "Texture Filtering - Negative LOD Bias",
                description: "Controls whether applications can sharpen textures using negative LOD bias.",
                type: "select",
                options: [
                    { value: 0, label: "Allow" },
                    { value: 1, label: "Clamp" }
                ],
                defaultValue: 0,
                category: "texture"
            },
            {
                id: "0x0056EF12",
                name: "Texture Filtering - Trilinear Optimization",
                description: "Enables trilinear optimization to reduce the performance cost of trilinear filtering with minimal quality impact.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" }
                ],
                defaultValue: 1,
                category: "texture"
            },
            {
                id: "0x00781AA5",
                name: "Anisotropic Filtering Mode",
                description: "Controls how anisotropic filtering is applied to textures.",
                type: "select",
                options: [
                    { value: 0, label: "Application Controlled" },
                    { value: 1, label: "User Defined" }
                ],
                defaultValue: 0,
                category: "texture"
            },
            {
                id: "0x00AB32C9",
                name: "Anisotropic Filtering Level",
                description: "Sets the level of anisotropic filtering when mode is User Defined.",
                type: "select",
                options: [
                    { value: 1, label: "1x" },
                    { value: 2, label: "2x" },
                    { value: 4, label: "4x" },
                    { value: 8, label: "8x" },
                    { value: 16, label: "16x" }
                ],
                defaultValue: 1,
                category: "texture"
            }
        ]
    },
    sync: {
        label: "Sync & Refresh",
        settings: [
            {
                id: "0x00A879CF",
                name: "Vertical Sync",
                description: "Synchronizes frame output with display refresh rate. Eliminates tearing but may introduce input latency.",
                type: "select",
                options: [
                    { value: 0, label: "Use Application Setting" },
                    { value: 1, label: "Off" },
                    { value: 2, label: "On" },
                    { value: 3, label: "Fast" },
                    { value: 4, label: "Adaptive" },
                    { value: 5, label: "Adaptive (Half Refresh Rate)" }
                ],
                defaultValue: 0,
                category: "sync"
            },
            {
                id: "0x00756D23",
                name: "Frame Rate Limiter",
                description: "Caps the maximum frame rate to reduce GPU power consumption and heat. Set to 0 for unlimited.",
                type: "number",
                min: 0,
                max: 1000,
                step: 1,
                defaultValue: 0,
                unit: "FPS",
                category: "sync"
            },
            {
                id: "0x00BB3412",
                name: "Low Latency Mode",
                description: "Reduces rendering queue to minimize input latency. Ultra submits frames just in time for GPU rendering.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" },
                    { value: 2, label: "Ultra" }
                ],
                defaultValue: 0,
                category: "sync"
            },
            {
                id: "0x00FC3478",
                name: "G-SYNC Mode",
                description: "Controls NVIDIA G-SYNC variable refresh rate technology for compatible displays.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "Fullscreen Only" },
                    { value: 2, label: "Fullscreen and Windowed" }
                ],
                defaultValue: 2,
                category: "sync"
            },
            {
                id: "0x009A2ED1",
                name: "Preferred Refresh Rate",
                description: "Sets the preferred display refresh rate for the application.",
                type: "select",
                options: [
                    { value: 0, label: "Application Controlled" },
                    { value: 1, label: "Highest Available" }
                ],
                defaultValue: 0,
                category: "sync"
            },
            {
                id: "0x00AE1234",
                name: "NVIDIA Reflex",
                description: "Reduces system latency by optimizing the render queue. Requires game support.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" },
                    { value: 2, label: "On + Boost" }
                ],
                defaultValue: 0,
                category: "sync"
            }
        ]
    },
    sli: {
        label: "SLI",
        settings: [
            {
                id: "0x00E12345",
                name: "SLI Rendering Mode",
                description: "Controls how rendering is distributed across GPUs in SLI configurations.",
                type: "select",
                options: [
                    { value: 0, label: "Autoselect" },
                    { value: 1, label: "Force Single GPU" },
                    { value: 2, label: "Force AFR 1" },
                    { value: 3, label: "Force AFR 2" },
                    { value: 4, label: "Force SFR" }
                ],
                defaultValue: 0,
                category: "sli"
            },
            {
                id: "0x00F23456",
                name: "SLI - GPU Count",
                description: "Limits the number of GPUs used for SLI rendering.",
                type: "select",
                options: [
                    { value: 0, label: "Autoselect" },
                    { value: 1, label: "Use 1 GPU" },
                    { value: 2, label: "Use 2 GPUs" },
                    { value: 3, label: "Use 3 GPUs" },
                    { value: 4, label: "Use 4 GPUs" }
                ],
                defaultValue: 0,
                category: "sli"
            },
            {
                id: "0x00D78901",
                name: "CUDA - Force P2 State",
                description: "Forces GPU power state during CUDA compute operations. May improve CUDA performance on multi-GPU systems.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" }
                ],
                defaultValue: 0,
                category: "sli"
            },
            {
                id: "0x00AB4567",
                name: "Vulkan/OpenGL Present Method",
                description: "Controls the presentation method for multi-GPU Vulkan and OpenGL applications.",
                type: "select",
                options: [
                    { value: 0, label: "Auto" },
                    { value: 1, label: "Prefer Single GPU" },
                    { value: 2, label: "Prefer Multi-GPU" }
                ],
                defaultValue: 0,
                category: "sli"
            }
        ]
    },
    power: {
        label: "Power",
        settings: [
            {
                id: "0x0040AB89",
                name: "Power Management Mode",
                description: "Controls GPU power management. 'Prefer Maximum Performance' prevents the GPU from downclocking to save power.",
                type: "select",
                options: [
                    { value: 0, label: "Optimal Power" },
                    { value: 1, label: "Adaptive" },
                    { value: 2, label: "Prefer Maximum Performance" },
                    { value: 3, label: "Prefer Consistent Performance" }
                ],
                defaultValue: 0,
                category: "power"
            },
            {
                id: "0x005AA678",
                name: "GPU Temperature Target",
                description: "Sets the target GPU temperature in Celsius. The GPU will throttle to stay below this temperature.",
                type: "number",
                min: 60,
                max: 95,
                step: 1,
                defaultValue: 83,
                unit: "°C",
                category: "power"
            },
            {
                id: "0x006BC234",
                name: "GPU Core Clock Offset",
                description: "Offset applied to the GPU core clock speed in MHz. Positive values overclock, negative values underclock.",
                type: "number",
                min: -500,
                max: 500,
                step: 5,
                defaultValue: 0,
                unit: "MHz",
                category: "power"
            },
            {
                id: "0x007DE890",
                name: "Memory Clock Offset",
                description: "Offset applied to the GPU memory clock speed in MHz.",
                type: "number",
                min: -1000,
                max: 2000,
                step: 10,
                defaultValue: 0,
                unit: "MHz",
                category: "power"
            },
            {
                id: "0x008EF456",
                name: "Fan Speed Control",
                description: "Controls GPU fan speed behavior. Auto lets the GPU manage fan speed, Manual allows custom curves.",
                type: "select",
                options: [
                    { value: 0, label: "Auto" },
                    { value: 1, label: "Manual" }
                ],
                defaultValue: 0,
                category: "power"
            },
            {
                id: "0x009FA012",
                name: "Power Limit (%)",
                description: "Sets the power limit as a percentage of the GPU's TDP. Higher values allow more power draw and potentially higher clocks.",
                type: "number",
                min: 50,
                max: 130,
                step: 1,
                defaultValue: 100,
                unit: "%",
                category: "power"
            }
        ]
    },
    rtx: {
        label: "RTX & AI",
        settings: [
            {
                id: "0x10AA0001",
                name: "DLSS Mode",
                description: "NVIDIA Deep Learning Super Sampling uses AI to boost frame rates while maintaining visual quality. Requires game support and RTX GPU.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "Auto" },
                    { value: 2, label: "Quality" },
                    { value: 3, label: "Balanced" },
                    { value: 4, label: "Performance" },
                    { value: 5, label: "Ultra Performance" }
                ],
                defaultValue: 0,
                category: "rtx"
            },
            {
                id: "0x10AA0002",
                name: "DLSS Sharpness",
                description: "Controls the sharpening applied after DLSS upscaling. Higher values produce sharper images but may introduce artifacts.",
                type: "number",
                min: 0,
                max: 100,
                step: 5,
                defaultValue: 50,
                unit: "%",
                category: "rtx"
            },
            {
                id: "0x10AA0003",
                name: "Ray Tracing",
                description: "Global ray tracing toggle. Enables hardware-accelerated ray tracing for supported applications using RT cores.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" }
                ],
                defaultValue: 1,
                category: "rtx"
            },
            {
                id: "0x10AA0004",
                name: "Ray Tracing Quality",
                description: "Controls the quality of ray-traced effects. Higher settings increase ray count per pixel for more accurate reflections and shadows.",
                type: "select",
                options: [
                    { value: 0, label: "Low" },
                    { value: 1, label: "Medium" },
                    { value: 2, label: "High" },
                    { value: 3, label: "Ultra" },
                    { value: 4, label: "Psycho" }
                ],
                defaultValue: 2,
                category: "rtx"
            },
            {
                id: "0x10AA0005",
                name: "Frame Generation",
                description: "DLSS 3 Frame Generation uses AI to create additional frames between rendered frames, dramatically boosting FPS. Requires RTX 40-series.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" }
                ],
                defaultValue: 0,
                category: "rtx"
            },
            {
                id: "0x10AA0006",
                name: "Resizable BAR",
                description: "Allows the CPU to access the full GPU memory at once instead of in 256MB chunks. Can improve performance in some games.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" }
                ],
                defaultValue: 1,
                category: "rtx"
            },
            {
                id: "0x10AA0007",
                name: "DLSS Ray Reconstruction",
                description: "Uses AI to denoise ray-traced effects more effectively than traditional denoisers. Produces higher quality RT reflections and lighting.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" }
                ],
                defaultValue: 0,
                category: "rtx"
            },
            {
                id: "0x10AA0008",
                name: "RTX Video Super Resolution",
                description: "Enhances lower-resolution video content using AI upscaling via RTX Tensor cores. Works with supported browsers and video players.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "Quality (1)" },
                    { value: 2, label: "Quality (2)" },
                    { value: 3, label: "Quality (3)" },
                    { value: 4, label: "Quality (4 - Highest)" }
                ],
                defaultValue: 0,
                category: "rtx"
            }
        ]
    },
    other: {
        label: "Other",
        settings: [
            {
                id: "0x00AA1234",
                name: "CUDA Cores",
                description: "Controls CUDA core availability for compute tasks.",
                type: "select",
                options: [
                    { value: 0, label: "All" },
                    { value: 1, label: "Limited" }
                ],
                defaultValue: 0,
                category: "other"
            },
            {
                id: "0x00BB5678",
                name: "OpenGL GDI Compatibility",
                description: "Controls compatibility mode for OpenGL applications using GDI.",
                type: "select",
                options: [
                    { value: 0, label: "Auto" },
                    { value: 1, label: "Compatible" },
                    { value: 2, label: "Performance" }
                ],
                defaultValue: 0,
                category: "other"
            },
            {
                id: "0x00CC9012",
                name: "Vulkan Pre-Emptive",
                description: "Controls Vulkan compute pre-emption granularity for improved responsiveness.",
                type: "select",
                options: [
                    { value: 0, label: "Driver Default" },
                    { value: 1, label: "Instruction Level" },
                    { value: 2, label: "Thread Level" },
                    { value: 3, label: "Thread Group Level" }
                ],
                defaultValue: 0,
                category: "other"
            },
            {
                id: "0x00DD3456",
                name: "Enable Overlay",
                description: "Controls the NVIDIA in-game overlay for screenshots, recording, and monitoring.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On" }
                ],
                defaultValue: 1,
                category: "other"
            },
            {
                id: "0x00EE7890",
                name: "Image Sharpening",
                description: "Applies a post-process sharpening filter to improve image clarity. Useful with upscaling or DLSS.",
                type: "select",
                options: [
                    { value: 0, label: "Off" },
                    { value: 1, label: "On (0.17)" },
                    { value: 2, label: "On (0.33)" },
                    { value: 3, label: "On (0.50)" },
                    { value: 4, label: "On (0.67)" },
                    { value: 5, label: "On (1.00)" }
                ],
                defaultValue: 0,
                category: "other"
            },
            {
                id: "0x00FF1234",
                name: "Background Max Frame Rate",
                description: "Limits frame rate when the application is in the background. Reduces GPU usage when not actively playing.",
                type: "number",
                min: 0,
                max: 240,
                step: 1,
                defaultValue: 20,
                unit: "FPS",
                category: "other"
            }
        ]
    }
};

// Predefined profiles
const DEFAULT_PROFILES = [
    {
        id: "base_profile",
        name: "Base Profile",
        executable: "_GLOBAL_DRIVER_PROFILE",
        type: "global",
        isCustom: false,
        settings: {}
    },
    {
        id: "cyberpunk2077",
        name: "Cyberpunk 2077",
        executable: "Cyberpunk2077.exe",
        type: "game",
        isCustom: false,
        settings: {
            "0x00A06946": 3,
            "0x1057EB71": 16,
            "0x00A879CF": 4,
            "0x00BB3412": 2,
            "0x0040AB89": 2,
            "0x10AA0001": 3,
            "0x10AA0003": 1,
            "0x10AA0004": 3,
            "0x10AA0005": 1,
            "0x10AA0007": 1
        }
    },
    {
        id: "eldenring",
        name: "Elden Ring",
        executable: "eldenring.exe",
        type: "game",
        isCustom: false,
        settings: {
            "0x00664339": 1,
            "0x00A879CF": 1,
            "0x00BB3412": 2,
            "0x0040AB89": 2
        }
    },
    {
        id: "csgo2",
        name: "Counter-Strike 2",
        executable: "cs2.exe",
        type: "game",
        isCustom: false,
        settings: {
            "0x00A879CF": 1,
            "0x00BB3412": 2,
            "0x00664339": 1,
            "0x0040AB89": 2,
            "0x00756D23": 0,
            "0x00AE1234": 2
        }
    },
    {
        id: "valorant",
        name: "Valorant",
        executable: "VALORANT-Win64-Shipping.exe",
        type: "game",
        isCustom: false,
        settings: {
            "0x00A879CF": 1,
            "0x00BB3412": 2,
            "0x00664339": 1,
            "0x0040AB89": 2,
            "0x00AE1234": 2
        }
    },
    {
        id: "hogwarts",
        name: "Hogwarts Legacy",
        executable: "HogwartsLegacy.exe",
        type: "game",
        isCustom: false,
        settings: {
            "0x00A06946": 4,
            "0x1057EB71": 16,
            "0x00A879CF": 4,
            "0x0040AB89": 2,
            "0x10F9DC81": 3,
            "0x10AA0001": 2,
            "0x10AA0003": 1,
            "0x10AA0004": 3,
            "0x10AA0007": 1
        }
    },
    {
        id: "rdr2",
        name: "Red Dead Redemption 2",
        executable: "RDR2.exe",
        type: "game",
        isCustom: false,
        settings: {
            "0x00A06946": 3,
            "0x1057EB71": 16,
            "0x00A879CF": 4,
            "0x0040AB89": 1,
            "0x209746A1": 2
        }
    },
    {
        id: "fortnite",
        name: "Fortnite",
        executable: "FortniteClient-Win64-Shipping.exe",
        type: "game",
        isCustom: false,
        settings: {
            "0x00A879CF": 1,
            "0x00BB3412": 2,
            "0x00664339": 1,
            "0x0040AB89": 2
        }
    },
    {
        id: "gta5",
        name: "Grand Theft Auto V",
        executable: "GTA5.exe",
        type: "game",
        isCustom: false,
        settings: {
            "0x1057EB71": 8,
            "0x00A879CF": 2,
            "0x209746A1": 2,
            "0x0040AB89": 1
        }
    },
    {
        id: "apex",
        name: "Apex Legends",
        executable: "r5apex.exe",
        type: "game",
        isCustom: false,
        settings: {
            "0x00A879CF": 1,
            "0x00BB3412": 1,
            "0x00664339": 1,
            "0x0040AB89": 2
        }
    },
    {
        id: "minecraft",
        name: "Minecraft (Java)",
        executable: "javaw.exe",
        type: "game",
        isCustom: false,
        settings: {
            "0x209746A1": 2,
            "0x1057EB71": 16,
            "0x00B56E2A": 1
        }
    },
    {
        id: "davinci",
        name: "DaVinci Resolve",
        executable: "Resolve.exe",
        type: "application",
        isCustom: false,
        settings: {
            "0x0040AB89": 2,
            "0x209746A1": 2,
            "0x00E73211": 5
        }
    },
    {
        id: "blender",
        name: "Blender",
        executable: "blender.exe",
        type: "application",
        isCustom: false,
        settings: {
            "0x0040AB89": 2,
            "0x00E73211": 5,
            "0x00AA1234": 0
        }
    },
    {
        id: "premiere",
        name: "Adobe Premiere Pro",
        executable: "Adobe Premiere Pro.exe",
        type: "application",
        isCustom: false,
        settings: {
            "0x0040AB89": 2,
            "0x209746A1": 2
        }
    },
    {
        id: "chrome",
        name: "Google Chrome",
        executable: "chrome.exe",
        type: "application",
        isCustom: false,
        settings: {
            "0x0040AB89": 0
        }
    }
];

// Preset configurations
const PRESETS = {
    performance: {
        name: "Max Performance",
        settings: {
            "0x00A06946": 0,
            "0x1057EB71": 1,
            "0x00664339": 1,
            "0x00E73211": 5,
            "0x209746A1": 2,
            "0x10F9DC81": 0,
            "0x00741142": 0,
            "0x00F1CB25": 0,
            "0x00D23456": 0,
            "0x00A879CF": 1,
            "0x00BB3412": 2,
            "0x0040AB89": 2,
            "0x00AE1234": 2,
            "0x00EE7890": 0,
            "0x00CEB891": 1,
            "0x0056EF12": 1,
            "0x10AA0001": 4,
            "0x10AA0003": 0,
            "0x10AA0005": 1,
            "0x10AA0006": 1
        }
    },
    quality: {
        name: "Max Quality",
        settings: {
            "0x00A06946": 4,
            "0x1057EB71": 16,
            "0x10F9DC81": 3,
            "0x00741142": 2,
            "0x00F1CB25": 8,
            "0x0019BB68": 8,
            "0x00D23456": 1,
            "0x00E12AB3": 1,
            "0x00A879CF": 2,
            "0x0040AB89": 2,
            "0x00EE7890": 3,
            "0x00CEB891": 0,
            "0x0056EF12": 0,
            "0x00E73211": 5,
            "0x10AA0001": 2,
            "0x10AA0003": 1,
            "0x10AA0004": 3,
            "0x10AA0005": 0,
            "0x10AA0007": 1
        }
    },
    balanced: {
        name: "Balanced",
        settings: {
            "0x00A06946": 2,
            "0x1057EB71": 8,
            "0x10F9DC81": 2,
            "0x00741142": 0,
            "0x00F1CB25": 4,
            "0x00A879CF": 0,
            "0x0040AB89": 1,
            "0x00E73211": 3,
            "0x209746A1": 0,
            "0x00BB3412": 0,
            "0x10AA0001": 3,
            "0x10AA0003": 1,
            "0x10AA0004": 2,
            "0x10AA0006": 1
        }
    }
};

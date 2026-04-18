export type QuestionType = 'radio' | 'selectbox' | 'multiselect' | 'slider' | 'text';

export interface Question {
  key: string;
  text: string | ((answers: Record<string, any>) => string);
  type: QuestionType;
  options?: string[] | number[] | ((answers: Record<string, any>) => string[]);
  condition: (answers: Record<string, any>) => boolean;
  help_text?: string;
}

export const questions: Question[] = [
  // --- Layer 1: Phase 1.1 - The Warm-Up & Current State ---
  { key: "user_name", text: "First, what should I call you?", type: "text", condition: () => true },
  { key: "category", text: "What are we shopping for today?", type: "radio", options: ["Laptop", "Smartphone"], condition: () => true },
  { key: "current_device", text: "What device are you using right now, and how long have you had it?", type: "text", condition: () => true },
  { key: "upgrade_motivation", text: "What's the main reason you're looking for a new one?", type: "radio", options: ["Old one is broken/slow", "Battery life is poor", "Need better performance for new tasks", "Just want the latest tech", "Other"], condition: () => true },
  { key: "emotional_core", text: "If you could magically change ONE thing about your current device, what would it be?", type: "text", condition: () => true },

  // --- Layer 1: Phase 1.2 - The Contextual Foundation ---
  { key: "budget", text: "What's your budget range in Indian Rupees (₹)?", type: "selectbox", options: ["Under ₹30k", "₹30-50k", "₹50-80k", "₹80-120k", "Above ₹120k"], condition: () => true },
  { key: "os_preference", text: "Do you have a preference for an operating system?", type: "selectbox", options: (a) => a.category === "Laptop" ? ["Windows", "macOS", "ChromeOS", "No preference"] : ["Android", "iOS", "No preference"], condition: () => true },
  { key: "primary_identity", text: "Which of these best describes you?", type: "selectbox", options: ["Student", "Working Professional", "Creative/Gamer", "Casual User", "Business Owner", "Parent/Senior"], condition: () => true },
  { key: "primary_use", text: "What's the single most important thing you'll use this device for?", type: "selectbox", options: ["Work/Productivity", "School/Study", "Creative work like video/photo editing", "Gaming", "Content consumption like streaming/social media", "Programming"], condition: () => true },
  { key: "longevity", text: "How many years do you realistically plan to keep this new device?", type: "radio", options: ["1-2 years", "3-4 years", "5+ years", "Until it breaks"], condition: () => true },

  // --- Layer 1: Phase 1.3 - Lifestyle & Environment Baseline ---
  { key: "portability", text: "Will this device live mostly on a desk, or will it be in your bag or hand all day?", type: "radio", options: ["Mostly on a desk", "I carry it daily—weight matters a lot", "It's a mix of both", "I travel very often"], condition: () => true },
  { key: "usage_environment", text: "Where do you use your current device the most?", type: "radio", options: ["Indoors at home/office", "Outdoors in bright sunlight", "On public transport/commuting", "In cafes/co-working spaces"], condition: () => true },
  { key: "battery_life", text: "On a typical busy day, how many hours are you truly away from a power outlet?", type: "radio", options: ["Mostly near a charger", "2-4 hours", "5-8 hours", "8+ hours"], condition: () => true },
  { key: "battery_intensity", text: "During that time away from an outlet, what are you mostly doing?", type: "radio", options: ["Light tasks like email and browsing", "Mixed use with some videos", "Heavy tasks like gaming or video calls"], condition: () => true },
  { key: "physical_care", text: "How would you describe your relationship with your devices?", type: "radio", options: ["I'm very careful—case and screen protector always", "I'm reasonably careful but accidents happen", "I have kids/pets—durability is key", "I'm outdoors a lot—it needs to be tough"], condition: () => true },
  { key: "tech_comfort_level", text: "How comfortable are you with tech specs? This helps me know how much to explain.", type: "radio", options: ["I know what RAM, GPU, and refresh rate mean", "I know the basics", "I'd prefer you explain things simply"], condition: () => true },

  // --- Layer 1: Phase 1.4 - The High-Level Priority Ranking ---
  { key: "performance_importance", text: "On a scale of 1-5, how important is raw speed and snappiness—apps opening instantly, no lag?", type: "slider", options: [1, 5], condition: () => true },
  { key: "battery_importance", text: "On a scale of 1-5, how important is it that this device lasts your entire day without needing a charge?", type: "slider", options: [1, 5], condition: () => true },
  { key: "display_importance", text: "On a scale of 1-5, how important is a stunning, bright, and color-accurate screen?", type: "slider", options: [1, 5], condition: () => true },
  { key: "portability_importance", text: "On a scale of 1-5, how important is a lightweight, sleek design that's easy to carry?", type: "slider", options: [1, 5], condition: () => true },
  { key: "camera_keyboard_importance", text: (a) => a.category === "Smartphone" ? "On a scale of 1-5, how important is camera quality?" : "On a scale of 1-5, how important is a great keyboard?", type: "slider", options: [1, 5], condition: () => true },

  // --- Layer 2: Deep Dives ---
  
  // Performance Deep Dive
  { key: "perf_baseline", text: "What's the most demanding task you'll do, even if it's just once a month?", type: "selectbox", options: ["Casual browsing/docs", "Programming/data analysis", "Light photo/video editing", "Heavy gaming/3D modeling", "Professional video editing/VFX"], condition: (a) => a.primary_use === "Gaming" || a.primary_use === "Creative work like video/photo editing" || a.primary_use === "Programming" || a.performance_importance >= 4 },
  { key: "perf_gaming", text: "What kind of gamer are you?", type: "radio", options: ["Casual/puzzle games", "Competitive esports titles like Valorant", "Immersive AAA story games"], condition: (a) => a.perf_baseline === "Heavy gaming/3D modeling" || a.primary_use === "Gaming" },
  { key: "perf_esports", text: "Do you care about high frame rates (120Hz+) for a competitive edge?", type: "radio", options: ["Yes, it's essential", "It's nice to have", "I don't care/play those games"], condition: (a) => a.perf_gaming === "Competitive esports titles like Valorant" },
  { key: "perf_creative", text: "What kind of creative work?", type: "radio", options: ["1080p video for social media", "4K professional video editing", "Photo editing/Graphic design", "3D modeling/Animation"], condition: (a) => a.perf_baseline === "Professional video editing/VFX" || a.perf_baseline === "Light photo/video editing" || a.primary_use === "Creative work like video/photo editing" },
  { key: "perf_programming", text: "What will you be programming?", type: "radio", options: ["Web development", "Mobile app development", "Data science/AI model training", "Computer science coursework"], condition: (a) => a.perf_baseline === "Programming/data analysis" || a.primary_use === "Programming" },
  { key: "perf_ram", text: "Think of RAM as your desk space. How many things do you have open at once?", type: "radio", options: ["A few tabs and apps", "Many tabs and apps—I multitask a lot", "I run heavy software that needs a lot of memory"], condition: (a) => a.primary_use === "Gaming" || a.primary_use === "Creative work like video/photo editing" || a.primary_use === "Programming" || a.performance_importance >= 4 },
  { key: "perf_future", text: "Do you expect your performance needs to increase significantly over the next few years?", type: "radio", options: ["No, my usage is stable", "Yes, I'm learning new skills", "Yes, software is always getting more demanding"], condition: (a) => a.primary_use === "Gaming" || a.primary_use === "Creative work like video/photo editing" || a.primary_use === "Programming" || a.performance_importance >= 4 },

  // Battery Life Deep Dive
  { key: "batt_baseline", text: (a) => `You mentioned being away from an outlet for ${a.battery_life} doing ${a.battery_intensity}. Is that a daily reality?`, type: "radio", options: ["Yes, almost every day", "A few times a week", "Only occasionally, but when it happens, it's critical"], condition: (a) => a.battery_importance >= 4 || a.battery_life === "8+ hours" },
  { key: "batt_charge_opp", text: "During a typical day, do you have a chance to top up the charge, even for 15 minutes?", type: "radio", options: ["Never", "Rarely", "Sometimes (e.g., at lunch)", "Often"], condition: (a) => a.battery_importance >= 4 || a.battery_life === "8+ hours" },
  { key: "batt_anxiety", text: "How do you feel when your battery drops below 20%?", type: "radio", options: ["I panic and look for a charger", "I get a bit anxious", "I don't really notice until it dies"], condition: (a) => a.battery_importance >= 4 || a.battery_life === "8+ hours" },
  { key: "batt_laptop_endurance", text: "Do you need your laptop to last through long meetings, flights, or classes without hunting for the one available outlet?", type: "radio", options: ["Yes, all-day endurance is non-negotiable", "It's a nice-to-have", "I can usually find an outlet"], condition: (a) => a.category === "Laptop" && (a.battery_importance >= 4 || a.battery_life === "8+ hours") },
  { key: "batt_speed_vs_cap", text: "If you had to choose, would you prefer a larger battery that lasts longer or a smaller battery that charges incredibly fast?", type: "radio", options: ["Larger battery for longer life", "Faster charging to top up quickly"], condition: (a) => a.battery_importance >= 4 || a.battery_life === "8+ hours" },

  // Display Quality Deep Dive
  { key: "disp_baseline", text: "What do you mostly look at on your screen?", type: "selectbox", options: ["Mostly text (emails, documents)", "Videos and movies", "Photos and graphics", "Games", "A mix of everything"], condition: (a) => a.primary_use === "Creative work like video/photo editing" || a.primary_use === "Gaming" || a.primary_use === "Content consumption like streaming/social media" || a.display_importance >= 4 },
  { key: "disp_outdoor", text: "Do you ever use your device outdoors in bright sunlight?", type: "radio", options: ["Never", "Rarely", "Sometimes", "Yes, all the time"], condition: (a) => a.primary_use === "Creative work like video/photo editing" || a.primary_use === "Gaming" || a.primary_use === "Content consumption like streaming/social media" || a.display_importance >= 4 },
  { key: "disp_color", text: "Do you need the colors on your screen to be very accurate, for things like photo editing or design work?", type: "radio", options: ["Yes, color accuracy is critical for my work", "It's a nice bonus, but not essential", "No, I don't think I'd notice"], condition: (a) => a.primary_use === "Creative work like video/photo editing" || a.primary_use === "Gaming" || a.primary_use === "Content consumption like streaming/social media" || a.display_importance >= 4 },
  { key: "disp_refresh", text: "Have you ever noticed and appreciated the 'smoothness' of a high-refresh-rate screen (like on an iPad Pro or high-end phone)?", type: "radio", options: ["Yes, I love it and want it on my next device", "I've seen it but could take it or leave it", "I've never noticed it", "What is refresh rate?"], condition: (a) => a.primary_use === "Creative work like video/photo editing" || a.primary_use === "Gaming" || a.primary_use === "Content consumption like streaming/social media" || a.display_importance >= 4 },
  { key: "disp_size", text: "Do you prefer a smaller, more portable screen or a larger, more immersive one?", type: "radio", options: ["Smaller screen for portability", "Larger screen for work/play", "A balance between the two"], condition: (a) => a.primary_use === "Creative work like video/photo editing" || a.primary_use === "Gaming" || a.primary_use === "Content consumption like streaming/social media" || a.display_importance >= 4 },
  { key: "disp_finish", text: "Do you notice reflections on glossy screens, or do you prefer a matte finish that reduces glare?", type: "radio", options: ["I hate glare, matte is a must", "Glossy is fine—I like the vibrant look", "I've never thought about it"], condition: (a) => a.primary_use === "Creative work like video/photo editing" || a.primary_use === "Gaming" || a.primary_use === "Content consumption like streaming/social media" || a.display_importance >= 4 },

  // Smartphone Camera Deep Dive
  { key: "cam_baseline", text: "What's the most common thing you take photos of?", type: "selectbox", options: ["People (friends, family, selfies)", "Places (landscapes, travel)", "Things (food, objects)", "Fast-moving subjects (kids, pets)"], condition: (a) => a.category === "Smartphone" && (a.primary_use === "Creative work like video/photo editing" || a.camera_keyboard_importance >= 4) },
  { key: "cam_people", text: "Do you use the selfie camera a lot?", type: "radio", options: ["Yes, all the time", "Occasionally", "Rarely"], condition: (a) => a.cam_baseline === "People (friends, family, selfies)" },
  { key: "cam_fast", text: "Tell me more about that. Is it kids playing sports, pets running around?", type: "radio", options: ["Kids/Pets indoors", "Kids/Pets outdoors", "Both"], condition: (a) => a.cam_baseline === "Fast-moving subjects (kids, pets)" },
  { key: "cam_lighting", text: "Do you find yourself taking a lot of photos in low light—like at restaurants, parties, or in the evening?", type: "radio", options: ["Yes, often", "Sometimes", "No, mostly in good light"], condition: (a) => a.category === "Smartphone" && (a.primary_use === "Creative work like video/photo editing" || a.camera_keyboard_importance >= 4) },
  { key: "cam_video", text: "Is shooting high-quality video as important as taking photos?", type: "radio", options: ["Yes, I shoot a lot of video", "It's a nice bonus", "No, I mostly take photos"], condition: (a) => a.category === "Smartphone" && (a.primary_use === "Creative work like video/photo editing" || a.camera_keyboard_importance >= 4) },
  { key: "cam_zoom", text: "Do you often find yourself trying to zoom in on faraway subjects?", type: "radio", options: ["Yes, at concerts, wildlife, etc.", "Occasionally", "Rarely"], condition: (a) => a.category === "Smartphone" && (a.primary_use === "Creative work like video/photo editing" || a.camera_keyboard_importance >= 4) },
  { key: "cam_editing", text: "Do you edit your photos after taking them?", type: "radio", options: ["Yes, extensively (Lightroom, etc.)", "Just basic filters/crops", "No, I prefer a great photo straight out of the camera"], condition: (a) => a.category === "Smartphone" && (a.primary_use === "Creative work like video/photo editing" || a.camera_keyboard_importance >= 4) },

  // Laptop Keyboard & Trackpad Deep Dive
  { key: "keyb_baseline", text: "On an average day, how many hours would you say you're actively typing?", type: "radio", options: ["<1 hour", "1-3 hours", "3-6 hours", "6+ hours—I'm a writer/coder"], condition: (a) => a.category === "Laptop" && (a.primary_use === "Work/Productivity" || a.primary_use === "Programming" || a.primary_use === "School/Study" || a.camera_keyboard_importance >= 4) },
  { key: "keyb_feel", text: "What kind of keyboard feel do you prefer?", type: "radio", options: ["Deep, clicky travel with good feedback", "Shallow, quiet, and fast (like a MacBook)", "I don't have a strong preference"], condition: (a) => a.category === "Laptop" && (a.primary_use === "Work/Productivity" || a.primary_use === "Programming" || a.primary_use === "School/Study" || a.camera_keyboard_importance >= 4) },
  { key: "keyb_numpad", text: "Do you regularly input numbers and require a dedicated number pad?", type: "radio", options: ["Yes, I use it daily", "It's nice to have", "No, I never use it"], condition: (a) => a.category === "Laptop" && (a.primary_use === "Work/Productivity" || a.primary_use === "Programming" || a.primary_use === "School/Study" || a.camera_keyboard_importance >= 4) },
  { key: "keyb_backlight", text: "Do you often work in dimly lit environments where a backlit keyboard is essential?", type: "radio", options: ["Yes, frequently", "Sometimes", "No, always in good light"], condition: (a) => a.category === "Laptop" && (a.primary_use === "Work/Productivity" || a.primary_use === "Programming" || a.primary_use === "School/Study" || a.camera_keyboard_importance >= 4) },
  { key: "keyb_trackpad", text: "Do you use an external mouse, or do you rely heavily on the laptop's trackpad?", type: "radio", options: ["I only use the trackpad", "I mostly use an external mouse", "I switch between both"], condition: (a) => a.category === "Laptop" && (a.primary_use === "Work/Productivity" || a.primary_use === "Programming" || a.primary_use === "School/Study" || a.camera_keyboard_importance >= 4) },

  // Durability & Build Quality Deep Dive
  { key: "dur_baseline", text: (a) => `You mentioned ${a.physical_care}. Can you tell me a bit more about the kind of wear and tear your device sees?`, type: "selectbox", options: ["It gets knocked around in my bag", "It's used in dusty/dirty environments", "It might get dropped occasionally", "I need it to survive a splash or light rain"], condition: (a) => a.physical_care === "I have kids/pets—durability is key" || a.physical_care === "I'm outdoors a lot—it needs to be tough" },
  { key: "dur_water", text: "How important is official water resistance (like an IP68 rating) for peace of mind?", type: "radio", options: ["It's a must-have", "It's a nice-to-have", "Not important"], condition: (a) => a.physical_care === "I have kids/pets—durability is key" || a.physical_care === "I'm outdoors a lot—it needs to be tough" },
  { key: "dur_material", text: "Do you have a preference for the material? Some people love the premium feel of metal, while others prefer lighter or tougher plastic.", type: "radio", options: ["Premium metal (aluminum)", "Tough/rugged plastic", "I don't care as long as it's durable"], condition: (a) => a.physical_care === "I have kids/pets—durability is key" || a.physical_care === "I'm outdoors a lot—it needs to be tough" },
  { key: "dur_hinge", text: "Have you ever had a laptop hinge become loose or wobbly? Is that a concern for you?", type: "radio", options: ["Yes, it drives me crazy—I want a rock-solid hinge", "I've noticed it but it's not a dealbreaker", "No, never had an issue"], condition: (a) => a.category === "Laptop" && (a.physical_care === "I have kids/pets—durability is key" || a.physical_care === "I'm outdoors a lot—it needs to be tough") },

  // Ports & Connectivity Deep Dive
  { key: "ports_baseline", text: "What do you actually plug into your device on a regular basis?", type: "multiselect", options: ["USB drives/hard drives", "SD cards from a camera", "An external monitor or projector", "Headphones", "Nothing, I use Bluetooth for everything"], condition: (a) => a.primary_identity === "Creative/Gamer" || a.primary_identity === "Working Professional" || a.primary_identity === "Student" || a.primary_identity === "Business Owner" },
  { key: "ports_legacy", text: "Do you still use devices with the old, rectangular USB-A connector?", type: "radio", options: ["Yes, all the time", "Sometimes", "No, everything is USB-C now"], condition: (a) => a.primary_identity === "Creative/Gamer" || a.primary_identity === "Working Professional" || a.primary_identity === "Student" || a.primary_identity === "Business Owner" },
  { key: "ports_video", text: "Do you need to connect to a specific type of external display, like HDMI?", type: "radio", options: ["Yes, HDMI is a must", "I use USB-C/Thunderbolt for display", "I never connect to external displays"], condition: (a) => a.primary_identity === "Creative/Gamer" || a.primary_identity === "Working Professional" || a.primary_identity === "Student" || a.primary_identity === "Business Owner" },
  { key: "ports_ethernet", text: "Do you ever need a dedicated Ethernet port for a faster, more reliable wired internet connection?", type: "radio", options: ["Yes, at work or for gaming", "Rarely, but it's good to have", "No, Wi-Fi is fine"], condition: (a) => a.primary_identity === "Creative/Gamer" || a.primary_identity === "Working Professional" || a.primary_identity === "Student" || a.primary_identity === "Business Owner" },
  { key: "ports_audio", text: "Do you still use wired headphones with a 3.5mm audio jack?", type: "radio", options: ["Yes, all the time", "Sometimes", "No, I've switched to wireless"], condition: (a) => a.primary_identity === "Creative/Gamer" || a.primary_identity === "Working Professional" || a.primary_identity === "Student" || a.primary_identity === "Business Owner" },

  // Future-Proofing & Software Deep Dive
  { key: "future_baseline", text: "Since you plan to keep this device for a long time, let's make sure it ages well. How important is it that the device is easy to repair or upgrade later?", type: "radio", options: ["Very important, I want to be able to fix it", "Somewhat important", "Not important—I'll just replace it"], condition: (a) => a.longevity === "3-4 years" || a.longevity === "5+ years" },
  { key: "future_updates", text: "Do you pay attention to how many years of software and security updates a manufacturer promises?", type: "radio", options: ["Yes, it's a major factor in my decision", "I'm vaguely aware of it", "No, I don't track that"], condition: (a) => a.category === "Smartphone" && (a.longevity === "3-4 years" || a.longevity === "5+ years") },
  { key: "future_upgrade", text: "Would you ever consider opening up the laptop to add more RAM or a larger SSD a few years down the line?", type: "radio", options: ["Yes, I'm comfortable doing that", "I'd pay someone to do it", "No, I'd rather buy a new one"], condition: (a) => a.category === "Laptop" && (a.longevity === "3-4 years" || a.longevity === "5+ years") },
  { key: "future_software", text: "Do you prefer a clean, bloatware-free software experience, or do you not mind pre-installed apps?", type: "radio", options: ["Clean Android/Windows is a must", "I can tolerate some extra apps if the price is right", "I don't care"], condition: (a) => a.longevity === "3-4 years" || a.longevity === "5+ years" },

  // --- Layer 3: Sub-Deep Dives ---
  { key: "sub_keyb_quiet", text: "Is the quietness because you work in a shared space like a library or an open-plan office, or do you just find loud keyboards annoying?", type: "radio", options: ["Shared space", "Personal preference"], condition: (a) => a.keyb_feel === "Shallow, quiet, and fast (like a MacBook)" },
  { key: "sub_disp_color", text: "Is your work color-critical, where a slight shift could mean a misprinted product or a rejected design? Or is it for more personal, creative projects?", type: "radio", options: ["It's for professional/client work", "It's for my personal high standards"], condition: (a) => a.disp_color === "Yes, color accuracy is critical for my work" },
  { key: "sub_port_weight", text: "Do you often use your laptop in cramped spaces, like on a train tray table or an airplane seat?", type: "radio", options: ["Yes, frequently", "Occasionally", "No, but I carry it in my bag all day"], condition: (a) => a.portability === "I carry it daily—weight matters a lot" }
];

export function getNextQuestion(answers: Record<string, any>): Question | null {
  for (const q of questions) {
    if (answers[q.key] === undefined) {
      if (q.condition(answers)) {
        return q;
      }
    }
  }
  return null;
}

export function getTotalQuestions(answers: Record<string, any>): number {
  let count = 0;
  for (const q of questions) {
    if (q.condition(answers)) {
      count++;
    }
  }
  return count;
}

/* =====================================================================
   BOZHENKO DIGITAL — SITE SETTINGS
   Edit this file only. Everything below shows on the site automatically.
   Leave a value as "" to hide it.
   ===================================================================== */
window.SITE = {
  /* --- Contacts (shown in footer, order form and WhatsApp button) --- */
  whatsapp: "353873714022",          // international format, digits only, e.g. "353871234567"
  email: "bozhenkodigital@gmail.com", // e.g. "hello@bozhenko.digital"
  instagram: "",         // full URL
  tiktok: "",            // full URL
  facebook: "",          // full URL

  /* --- Where order requests go ---
     Uses FormSubmit (free): orders arrive by email. The very first order sends an
     activation email to that address — click the link in it once, after that
     every order arrives in the inbox.
     Until this is set, the form says plainly that it could not be sent
     and offers WhatsApp / email instead. It never shows a fake "sent". */
  formEndpoint: "https://formsubmit.co/ajax/bozhenkodigital@gmail.com",

  /* --- Black Friday offer --- */
  offerEnds: "2026-11-30T23:59:00", // countdown target; set "" to hide the countdown
  
  packages: [
    { id: "single", name: "1 ad video", note: "Built from your existing photos, clips & reviews", price: 33, was: 99 },
    { id: "pack4",  name: "4 business Reels", note: "For your key holidays & sales", price: 98, was: 275, featured: true },
    { id: "pack8",  name: "8 business Reels", note: "Every key date covered", price: 175, was: 400 }
  ],

  /* --- Extra services (each gets a "Request a quote" button) --- */
  extras: [
    { id: "shoot",   name: "Video & photo shoot",     text: "Would you like fresh footage as well? We can arrange a video or photo shoot for your business, priced to the job." },
    { id: "meta",    name: "Meta ads management",     text: "Facebook & Instagram campaign setup, targeting and ongoing optimisation." },
    { id: "google",  name: "Google Ads & Maps",       text: "Search and local campaigns that put you in front of nearby customers." },
    { id: "gbp",     name: "Google Business Profile", text: "Setup and optimisation, so you show up properly on Google Search and Maps." },
    { id: "tiktok",  name: "TikTok ads",              text: "Campaign setup and management built around short-form video." },
    { id: "landing", name: "Business landing page",   text: "A fast, focused one-page site built to turn ad clicks into enquiries." }
  ],

  /* --- Our work ---
     Every ad below shows in the film strip, in this order.
     hero: true  -> also dealt into the fan of cards at the top (first one is in front)
     name / place / tag : the film title over each frame
     note    : the short line written under it
     video   : full ad with sound (plays in the cinema frame)
     poster  : still frame shown before play
     preview : small silent loop, only needed for the hero cards */
  work: [
    { name: "Party Balloon", place: "Limerick", tag: "Birthday setups", hero: true,
      note: "Made in Limerick for Limerick. Real reactions, and more balloons than we could count.",
      video: "assets/work/partyballoon-birthday.mp4", poster: "assets/work/partyballoon-birthday.webp", preview: "assets/work/partyballoon-birthday-preview.mp4" },
    { name: "Adonis Flowers & Gifts", place: "Dublin 8", tag: "Christmas", hero: true,
      note: "Their flowers do the talking, so we kept the words soft and few.",
      video: "assets/work/adonis-christmas.mp4", poster: "assets/work/adonis-christmas.webp", preview: "assets/work/adonis-christmas-preview.mp4" },
    { name: "Kate’s Kitchen", place: "Sligo", tag: "Christmas", hero: true,
      note: "Christmas in one box, from three sisters. Their smiles did half the work.",
      video: "assets/work/kates-kitchen-christmas.mp4", poster: "assets/work/kates-kitchen-christmas.webp", preview: "assets/work/kates-kitchen-christmas-preview.mp4" },
    { name: "Kate’s Kitchen", place: "Sligo", tag: "Black Friday",
      note: "Skip the queues, Sligo style. Full hampers, bright colours, not a second wasted.",
      video: "assets/work/kates-kitchen-blackfriday.mp4", poster: "assets/work/kates-kitchen-blackfriday.webp" },
    { name: "Lia Árann", place: "Aran Islands", tag: "Christmas", hero: true,
      note: "Celtic legends from the Aran Islands. We gave the designs room, and a bit of starlight.",
      video: "assets/work/lia-arann-christmas.mp4", poster: "assets/work/lia-arann-christmas.webp", preview: "assets/work/lia-arann-christmas-preview.mp4" },
    { name: "Lia Árann", place: "Aran Islands", tag: "Green Friday",
      note: "A Green Friday, not a Black one: buy one thing that lasts. Glad to tell it.",
      video: "assets/work/lia-arann-greenfriday.mp4", poster: "assets/work/lia-arann-greenfriday.webp" },
    { name: "Mezze", place: "Tramore", tag: "Black Friday",
      note: "Spice boxes and hampers in their own sunny orange. Pure joy to cut.",
      video: "assets/work/mezze-blackfriday.mp4", poster: "assets/work/mezze-blackfriday.webp" },
    { name: "Mezze", place: "Tramore", tag: "Christmas",
      note: "Christmas, made to share. Feast nights and platters, with the warmth turned right up.",
      video: "assets/work/mezze-christmas.mp4", poster: "assets/work/mezze-christmas.webp" },
    { name: "Man of Aran Fudge", place: "Inis Mór", tag: "Christmas",
      note: "A granny’s toffee and an Inis Oírr sunset. A small story we were honoured to tell.",
      video: "assets/work/man-of-aran-fudge-christmas.mp4", poster: "assets/work/man-of-aran-fudge-christmas.webp" },
    { name: "Man of Aran Fudge", place: "Inis Mór", tag: "Black Friday",
      note: "Slow golden pours and a box tied with gold. Hard work on an empty stomach.",
      video: "assets/work/man-of-aran-fudge-blackfriday.mp4", poster: "assets/work/man-of-aran-fudge-blackfriday.webp" },
    { name: "C Beauty", place: "Spiddal", tag: "Christmas",
      note: "All about the gift of switching off. We nearly switched off ourselves watching it back.",
      video: "assets/work/cbeauty-christmas.mp4", poster: "assets/work/cbeauty-christmas.webp" },
    { name: "C Beauty", place: "Spiddal", tag: "Black Friday",
      note: "A quiet Black Friday from Connemara. We slowed every cut right down to match.",
      video: "assets/work/cbeauty-blackfriday.mp4", poster: "assets/work/cbeauty-blackfriday.webp" },
    { name: "West Ireland Art", place: "Connemara", tag: "Christmas",
      note: "A donkey in a Santa hat. Some Christmas ads very nearly write themselves.",
      video: "assets/work/westirelandart-christmas.mp4", poster: "assets/work/westirelandart-christmas.webp" },
    { name: "West Ireland Art", place: "Connemara", tag: "Black Friday",
      note: "Currachs, haystacks and western skies. Mostly we just stayed out of the paintings’ way.",
      video: "assets/work/westirelandart-blackfriday.mp4", poster: "assets/work/westirelandart-blackfriday.webp" },
    { name: "Healthy Bee", place: "", tag: "Christmas",
      note: "A gift that tastes like summer: honey, hampers and a satin bow.",
      video: "assets/work/healthybee-christmas.mp4", poster: "assets/work/healthybee-christmas.webp" },
    { name: "Healthy Bee", place: "", tag: "Black Friday",
      note: "Raw honey with a golden Black Friday drip. The sweetest edit of our month.",
      video: "assets/work/healthybee-blackfriday.mp4", poster: "assets/work/healthybee-blackfriday.webp" },
    { name: "Craft Food Traders", place: "", tag: "Christmas",
      note: "Gift boxes full of Irish makers. “Proper biscuits” was our favourite line.",
      video: "assets/work/craftfood-christmas.mp4", poster: "assets/work/craftfood-christmas.webp" },
    { name: "Craft Food Traders", place: "", tag: "Black Friday",
      note: "Black Friday, the Irish-made way. We were starving by the final cut.",
      video: "assets/work/craftfood-blackfriday.mp4", poster: "assets/work/craftfood-blackfriday.webp" },
    { name: "Dungarvan Tech", place: "Dungarvan", tag: "Black Friday",
      note: "Cracked screens in, working phones out. Bold and quick, like a good repair.",
      video: "assets/work/dungarvan-tech-blackfriday.mp4", poster: "assets/work/dungarvan-tech-blackfriday.webp" },
    { name: "Dungarvan Tech", place: "Dungarvan", tag: "Christmas",
      note: "Phones, tablets and stocking fillers that just work. Simple, honest and bright.",
      video: "assets/work/dungarvan-tech-christmas.mp4", poster: "assets/work/dungarvan-tech-christmas.webp" },
    { name: "Brian Kelly Services", place: "Leinster", tag: "Christmas",
      note: "Clean paths and a chimney fit for Santa. Great fun to put together.",
      video: "assets/work/brian-kelly-christmas.mp4", poster: "assets/work/brian-kelly-christmas.webp" },
    { name: "Brian Kelly Services", place: "Leinster", tag: "Black Friday",
      note: "“Black Friday. Not black walls.” The before-and-afters did the rest.",
      video: "assets/work/brian-kelly-blackfriday.mp4", poster: "assets/work/brian-kelly-blackfriday.webp" }
  ],

  /* --- Public site address (used for Google/social previews) --- */
  siteUrl: "https://bozhenko-digital.vercel.app"
};

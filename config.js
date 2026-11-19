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
    { id: "single", name: "1 ad video", note: "Built from your existing photos, clips & reviews", price: 47, was: 120, featured: true },
    { id: "pack4",  name: "4 Reels pack", note: "For your key holidays & sales", price: 130, was: 250 },
    { id: "pack8",  name: "8 Reels pack", note: "Every key date covered", price: 220, was: 450 }
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

  /* --- Work examples (up to 6) ---
     Put video files in assets/work/. "poster" is a still frame shown before play.
     An entry without "video" shows as a tidy "new example soon" card. */
  work: [
    {
      title: "Party Balloon — Birthday setups",
      tag: "Black Friday promo",
      format: "9:16 Reel",
      video: "assets/work/partyballoon-blackfriday-9x16.mp4",
      poster: "assets/work/partyballoon-blackfriday-9x16.jpg",
      price: 47, was: 120,
      made: "Built from existing clips & photos" // optional one-liner, e.g. what materials it was made from
    },
    { title: "", tag: "Product ad", format: "9:16 Reel" },
    { title: "", tag: "Service business", format: "9:16 Reel" },
    { title: "", tag: "Christmas sale", format: "9:16 Reel" },
    { title: "", tag: "Restaurant / café", format: "4:5 Feed ad" },
    { title: "", tag: "Beauty & salon", format: "9:16 Reel" }
  ]
};

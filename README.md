# The Hypnotic Closing

Responsive brand website in warm ivory, black, and orange. Includes the original brand logo, a generated chrome hero emblem, offer/method sections, audience information, FAQs, and an accessible booking dialog.

## Preview

Requires Node.js. No dependencies or build step.

```sh
npm start
```

Open http://127.0.0.1:4173. Deploy the `dist` folder with any static hosting provider.

## Updating the website

- Copy and section content: `dist/index.html`
- Layout, colors, responsive styles: `dist/styles.css`
- Booking URL: `BOOKING_URL` in `dist/app.js`
- Images: `dist/assets/`

Booking deliberately shows a coming-soon dialog until the confirmed scheduling URL is supplied. No lead data is collected or sent. Offer copy is provisional; no testimonials or performance statistics are asserted.

The logo and chrome hero were created with built-in image generation. Typography uses Barlow Condensed and DM Sans from Google Fonts, with local system fallbacks. No analytics or external JavaScript dependencies.

## Elastic button effect

`dist/symbiote.js` and `dist/symbiote.css` add a lightweight SVG tendril to the orange Explore the method button. It attaches within 58px, stretches up to 240px, and retracts with a damped spring. The viewport overlay follows scroll without intercepting clicks. One scheduled animation frame batches geometry reads and path updates; the loop sleeps when settled and stops offscreen, on window blur, or when the page is hidden. Touch devices keep the static treatment, and reduced-motion preferences disable the effect. No animation library, image sequence, WebGL, or SVG blur filter is used.


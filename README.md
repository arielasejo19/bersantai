# Bersantai

Cross-platform hospitality application for an exclusive villa, designed to be configurable for hotel workflows.

## v0.1 — Initial foundation

- Expo + React Native + TypeScript
- Web / iOS / Android-ready routing
- Bersantai design tokens based on the supplied logo
- Luxury tropical landing page
- Property page
- Initial booking request flow
- Booking request success state
- Reusable UI components

## Product direction

Bersantai is being built as a real product, not a static mockup.

Initial Villa workflow:

`Guest → Booking Request → Host Review → Accept/Reject`

Future Hotel workflow:

`Guest → Booking Request → Receptionist Review → Accept/Reject → Unit Assignment`

The booking engine will use a generic **Unit** concept so the same architecture can represent one private villa or many hotel rooms/suites.

## Local development

Install Node.js LTS, then:

```bash
npm install
npm start
```

Web:

```bash
npm run web
```

Android:

```bash
npm run android
```

iOS:

```bash
npm run ios
```

## Next stage

1. Add real property/unit/booking database in Supabase
2. Add authentication and role-based access
3. Replace placeholder booking inputs with real date/availability controls
4. Persist booking requests
5. Build Host dashboard
6. Add Villa/Hotel property configuration
7. Add receptionist workflow
8. Add deployment and CI

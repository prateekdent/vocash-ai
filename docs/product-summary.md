# Vocash Product Summary

## Problem
Expense tracking apps in India are typing-heavy and not optimized for Hindi-first conversational users.

## Solution
Vocash enables users to speak expenses in Hindi or English, extracts structured fields via AI, and saves transactions with minimal manual effort.

## MVP Scope
- Auth: register/login/JWT profile fetch.
- Voice input to text on device.
- Backend AI extraction and category mapping.
- Expense CRUD and transaction list.
- Dashboard monthly summary and category breakdown.
- Daily free limit (3 voice extractions/day) + Pro upsell path.

## Target Users
- India-based users comfortable with Hindi/English speech.
- Students and salaried users needing lightweight spending tracking.
- Free users with upgrade potential to Pro.

## Core Modules
- Mobile app (React Native): voice capture, UX, local session handling.
- Backend API (FastAPI): auth, extraction orchestration, usage controls, payments verification.
- Database (MongoDB Atlas): users, expenses, usage, budgets.
- AI extraction (OpenAI): structured parsing from mixed-language text.

## Dependency Highlights
- Voice: `@react-native-voice/voice`
- State: Zustand
- API client: Axios
- Backend: FastAPI, Motor, Pydantic v2, python-jose, passlib
- AI: OpenAI Python SDK

## Key Risks
1. Speech-to-text quality variation for Hindi accents/noise.
2. Incorrect category extraction for mixed-language phrases.
3. API cost growth if limit checks are bypassed or fail.
4. App store policy/privacy disclosures for AI + financial data.

## Ambiguities to Resolve
- STT provider ambiguity: doc lists `@react-native-voice/voice` and separately suggests Google Cloud STT in risks.
- Date parsing behavior for relative dates (“kal”, “parso”) across timezones.
- Google sign-in is listed in UI but not in API endpoint list.
- Pro features include family accounts/cloud backup but no data model/API details yet.

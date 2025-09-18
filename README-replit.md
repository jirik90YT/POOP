# Pocket Signals – Replit ready

Jedno-procesové nasazení na Replitu.
- Express server (port 3000) **slouží i statický frontend** (client/dist).
- Přepínání **NORMAL/OTC** přes `/api/switch`.
- Živý stream signálu přes `/api/stream` (SSE).

## Kroky
1) V `server/.env` vyplň `PO_SSID` (celý frame `42["auth", {...}]` z DevTools > WebSocket Frames).
   - `cp server/.env.example server/.env` a doplň hodnoty.
2) Klikni **Run** na Replitu (poprvé proběhne `setup`, `build`, pak `start`).
3) Otevři webovou URL Replitu – poběží produkční build.

### Poznámky
- Pokud bude třeba upravit Socket.IO event názvy, edituj `server/server.js` (funkce `subscribeActive()` a handlery v `ws.on('message')`).

**Bezpečnost**: nikdy neukládej reálný účet/token do veřejného Replu. Používej demo.

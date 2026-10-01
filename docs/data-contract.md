# Data contract v1

Eén upload = één of meer metingen. De ESP32 kan een batch sturen
na een periode zonder internet.

POST /upload
Authorization: Bearer <device-token>

{
  "schemaVersion": 1,
  "deviceId": "fiets-01",
  "rideId": "2026-10-01T14-30-00Z",
  "samples": [
    {
      "t": 1727800000,
      "speedKmh": 24.5,
      "cadenceRpm": 82,
      "temperatureC": 14.2,
      "lightLux": 350,
      "heartRateBpm": 145,
      "tirePressureBar": 4.8
    }
  ]
}

| Veld            | Type   | Eenheid | Verplicht | Opmerking       |
|-----------------|--------|---------|-----------|-----------------|
| t               | number | s (UTC) | ja        | Unix-tijd       |
| speedKmh        | number | km/h    | ja        |                 |
| cadenceRpm      | number | rpm     | ja        |                 |
| temperatureC    | number | °C      | ja        |                 |
| lightLux        | number | lux     | ja        |                 |
| heartRateBpm    | number | bpm     | ja        |                 |
| tirePressureBar | number | bar     | nee       | extra parameter |
| brakeForceN     | number | N       | nee       | extra parameter |
| powerW          | number | W       | nee       | extra parameter |

Regels:
- Ontbrekende optionele velden weglaten, geen `null` sturen.
- Bij een wijziging van het formaat `schemaVersion` ophogen.
- Response: 200 bij succes, 400 bij ongeldige data, 401 bij onbekend token.
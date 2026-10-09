# RogueByte Cyber Lab — Operations & Maintenance Guide
**Creator:** SidoDev-Dz

---

## 1. Routine Operations

### Checking System Health
```bash
curl http://localhost:3000/api/health
```
Returns:
```json
{
  "status": "HEALTHY",
  "service": "RogueByte Cyber Lab Platform",
  "version": "1.0.0-black-gray",
  "owner": "SidoDev-Dz",
  "database": "CONNECTED_PERSISTENT",
  "activeLabsCount": 0,
  "maintenanceMode": false
}
```

### Enabling Maintenance Mode
Administrators can enable maintenance mode from the **Admin Center** (`/api/v1/admin/settings`), or via API:
```bash
curl -X PATCH http://localhost:3000/api/v1/admin/settings \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"maintenanceMode": true}'
```

### Lab Session Lifecycle & Cleanup
- An automatic cleanup daemon runs every 30 seconds to terminate expired lab container sessions.
- Admins can force-terminate any active lab from the **Active Labs** tab in the Admin Center.

---

## 2. Backup and Disaster Recovery

### Backing up Persistent Database State
All persistent user accounts, completed attempts, submission logs, and certificates are saved in `data/roguebyte_db.json`.
To create an archive backup:
```bash
tar -czvf "roguebyte_backup_$(date +%Y%m%d_%H%M%S).tar.gz" data/
```

### Restoring from Backup
```bash
tar -xzvf roguebyte_backup_YYYYMMDD_HHMMSS.tar.gz
```

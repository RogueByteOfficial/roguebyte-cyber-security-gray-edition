# RogueByte Cyber Lab — Training Mission Curriculum
**Creator:** SidoDev-Dz  
**Catalog Status:** 16 Functional Production Missions

---

## Overview

RogueByte Cyber Lab includes 16 fully specified, functional cybersecurity training missions across 4 industry domains. At least six missions utilize live, isolated execution environments with interactive terminal command emulation.

---

## 1. Linux Hardening & System Forensics

### Mission 1: Inspect File Permissions (`m-linux-01`)
- **Difficulty:** Beginner | **XP Bounty:** 100
- **Lab Profile:** `lab-linux-permissions`
- **Submission Type:** FLAG (`ROGUE{su1d_p3rm1ss10n_3xp0s3d_2026}`)
- **Objectives:** Inspect file access modes using `ls -la` and `stat`.

### Mission 2: Identify Insecure SUID Configuration (`m-linux-02`)
- **Difficulty:** Intermediate | **XP Bounty:** 150
- **Prerequisites:** `m-linux-01`
- **Lab Profile:** `lab-linux-permissions`
- **Submission Type:** ANSWER (`4777`)
- **Objectives:** Discover world-writable SUID binaries that permit arbitrary root execution.

### Mission 3: Remediate Insecure File Permissions (`m-linux-03`)
- **Difficulty:** Intermediate | **XP Bounty:** 200
- **Prerequisites:** `m-linux-02`
- **Lab Profile:** `lab-linux-permissions`
- **Submission Type:** LAB_STATE (Automated live sandbox audit)
- **Objectives:** Execute `chmod 0640 /etc/shadow` and secure `/var/www/html/config.php`.

### Mission 4: Investigate Authentication Logs (`m-linux-04`)
- **Difficulty:** Intermediate | **XP Bounty:** 180
- **Prerequisites:** `m-linux-01`
- **Lab Profile:** `lab-linux-auth-logs`
- **Submission Type:** FLAG (`ROGUE{brut3_f0rc3_c0mpr0m1s3_203.0.113.88}`)
- **Objectives:** Investigate `/var/log/auth.log` SSH brute-force breach.

---

## 2. Network Forensics & Traffic Analysis

### Mission 5: Interpret IP Addresses and Subnets (`m-net-01`)
- **Difficulty:** Beginner | **XP Bounty:** 90
- **Submission Type:** ANSWER (`30`)
- **Objectives:** Calculate usable host counts for `192.168.10.64/27`.

### Mission 6: Analyze PCAP Traffic & Cleartext Leaks (`m-net-02`)
- **Difficulty:** Intermediate | **XP Bounty:** 160
- **Lab Profile:** `lab-network-pcap`
- **Submission Type:** FLAG (`ROGUE{pl41nt3xt_cr3ds_sn1ff3d_8080}`)
- **Objectives:** Inspect cleartext HTTP POST authentication in Wireshark/PCAP capture.

### Mission 7: Identify Unexpected C2 Network Traffic (`m-net-03`)
- **Difficulty:** Intermediate | **XP Bounty:** 170
- **Lab Profile:** `lab-network-pcap`
- **Submission Type:** ANSWER (`198.51.100.44`)
- **Objectives:** Identify malicious outbound Command and Control (C2) beaconing.

### Mission 8: Interpret Nmap Port Scan & Backdoor Discovery (`m-net-04`)
- **Difficulty:** Intermediate | **XP Bounty:** 160
- **Lab Profile:** `lab-network-nmap`
- **Submission Type:** FLAG (`ROGUE{vsftpd_b4ckd00r_p0rt_21_f0und}`)
- **Objectives:** Analyze service banner grabbing and identify backdoored FTP service.

---

## 3. Web Security & Application Exploitation

### Mission 9: Identify Insecure SQL Query Construction (`m-web-01`)
- **Difficulty:** Beginner | **XP Bounty:** 140
- **Lab Profile:** `lab-web-sqli`
- **Submission Type:** FLAG (`ROGUE{sql1_auth_byp4ss_succ3ssful_992}`)
- **Objectives:** Craft SQL injection tautology payload to bypass authentication.

### Mission 10: Diagnose Stored Cross-Site Scripting (XSS) (`m-web-02`)
- **Difficulty:** Intermediate | **XP Bounty:** 150
- **Submission Type:** ANSWER (`HTML Entity Encoding`)
- **Objectives:** Specify context-aware HTML entity escaping to neutralize XSS sinks.

### Mission 11: Detect Insecure Direct Object Reference (IDOR) (`m-web-03`)
- **Difficulty:** Intermediate | **XP Bounty:** 160
- **Submission Type:** ANSWER (`Object Ownership Verification`)
- **Objectives:** Mitigate authorization bypasses on REST API entity retrieval.

### Mission 12: Verify CSRF Defense Implementation (`m-web-04`)
- **Difficulty:** Advanced | **XP Bounty:** 180
- **Submission Type:** ANSWER (`SameSite=Strict`)
- **Objectives:** Validate anti-CSRF token synchronization and SameSite cookie defense.

---

## 4. Defensive Security & Threat Hunting

### Mission 13: Investigate Suspicious Login Events (`m-def-01`)
- **Difficulty:** Beginner | **XP Bounty:** 120
- **Submission Type:** ANSWER (`Impossible Travel`)
- **Objectives:** Correlate geographic anomalies and velocity violations in identity logs.

### Mission 14: Identify Threat Indicators in Synthetic Incident Logs (`m-def-02`)
- **Difficulty:** Intermediate | **XP Bounty:** 170
- **Lab Profile:** `lab-defensive-siem`
- **Submission Type:** STRUCTURED_JSON
- **Objectives:** Deobfuscate base64 PowerShell command line and submit structured IOCs.

### Mission 15: Write and Test a Detection Rule (`m-def-03`)
- **Difficulty:** Advanced | **XP Bounty:** 200
- **Lab Profile:** `lab-defensive-siem`
- **Submission Type:** ANSWER (`attack.t1059.001`)
- **Objectives:** Map Sigma process creation rules to MITRE ATT&CK techniques.

### Mission 16: Produce Security Incident Triage Report (`m-def-04`)
- **Difficulty:** Advanced | **XP Bounty:** 220
- **Submission Type:** REPORT (Verified length >= 60 words & 4 core triage sections)
- **Objectives:** Produce a comprehensive incident response triage summary.

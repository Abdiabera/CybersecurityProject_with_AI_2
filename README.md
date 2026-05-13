🛡️ Enterprise Cybersecurity & Infrastructure Project
Author: Abdi  Abera

Program: Per Scholas Cybersecurity (Greater Boston 2026-BOS-02)

📄 Page 1: Network Defense & Firewall Architecture
This section documents the implementation of advanced network security protocols using Cisco IOS.

Zone-Based Policy Firewall (ZPF) Implementation
Architectural Segmentation: Designed a secure topology by segmenting the network into IN-ZONE (Internal) and OUT-ZONE (External).

Stateful Inspection: Configured class-maps and policy-maps on R3 to inspect protocols including HTTP, HTTPS, DNS, ICMP, and SSH.

Unsolicited Traffic Blocking: Successfully implemented rules that allow internal hosts (PC-C) to access external resources while automatically dropping unsolicited inbound packets from external hosts (PC-A).

Access Control & Hardening
Standard & Extended ACLs: Configured numbered and named ACLs to restrict traffic based on IP addresses and port numbers.

IPv6 Security: Implemented IPv6 ACLs to secure modern network addressing schemes.

Device Hardening: Applied SSH security, password encryption, and banner configurations to routers and wireless controllers.

📄 Page 2: Cybersecurity Tools & Threat Analysis
This section covers the practical application of industry-standard security tools for monitoring and investigation.

SIEM & Log Management
Splunk Integration: Utilized Splunk for log aggregation, tracking network traffic flow, and identifying potential security incidents.

Traffic Observation: Analyzed routed network traffic to identify patterns and ensure policy compliance.

Steganography & Digital Forensics
Data Concealment: Practiced embedding secret documents within media files using Steghide.

Forensic Discovery: Utilized strings and ExifTool to detect hidden metadata and appended binary data within suspicious files.

Vulnerability Assessment: Investigated the OWASP Top 10 to understand common web vulnerabilities and mitigation strategies.

📄 Page 3: Security Automation & Virtualization
This section highlights the use of programming and virtualization to build and test secure environments.

Python for Security
CryptoSimulator: Developed a Python-based simulator to demonstrate encryption principles and secure data handling.

Automation Scripts: Created tools for automated file conversion and system administration tasks.

Advanced UI: Integrated OpenCV and MediaPipe for eye-controlled system interfaces, exploring biometric-style interaction.

Virtualization & Lab Environments
Cross-Platform Testing: Configured security labs across Windows 11 (Alienware) and macOS Apple Silicon (M1).

Platform Deployment: Managed virtualized instances of Kali Linux and Ubuntu via VirtualBox and WSL for penetration testing and network service verification (FTP, Telnet, SSH).

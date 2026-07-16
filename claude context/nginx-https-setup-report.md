\# HTTPS Setup Report — zoltanbiro.ca

&#x20;

\## Summary

&#x20;

The site at `zoltanbiro.ca` now serves traffic over HTTPS. Nginx was installed as a reverse proxy in front of the existing Express application, and a free TLS certificate from Let's Encrypt (via Certbot) was issued and wired into Nginx automatically. HTTP requests now redirect to HTTPS, and HTTPS requests are decrypted by Nginx and forwarded internally to Express.

&#x20;

\## Starting Point

&#x20;

Before this work:

\- Express app ran on port 8080

\- Port 80 traffic was forwarded directly to 8080 (no reverse proxy, no TLS)

\- No SSL certificate existed

\## What Was Built

&#x20;

\### 1. Firewall changes (two layers)

&#x20;

Oracle Cloud VMs have two independent firewalls that both must allow traffic, or requests silently time out:

&#x20;

\- \*\*Oracle Cloud Security List / NSG\*\* (console-level, controls traffic before it reaches the VM at all)

\- \*\*OS-level firewall\*\* (`iptables`/`ufw`, controls traffic once it reaches the VM's network stack)

Port 443 (HTTPS) was opened on both layers, in addition to the port 80 (HTTP) that was already open.

&#x20;

\### 2. Removed the old port 80 → 8080 forwarding

&#x20;

The previous setup forwarded raw port 80 traffic straight to Express. This was removed so that Nginx — not Express — owns ports 80 and 443. This step was also required for Certbot's domain-verification challenge to work, since that challenge runs over port 80.

&#x20;

\### 3. Installed and configured Nginx as a reverse proxy

&#x20;

Nginx was installed and configured with a server block for `zoltanbiro.ca` that forwards incoming requests to the Express app running on `127.0.0.1:8080`. Relevant proxy headers were set so Express still sees accurate information about the original request (client IP, protocol, host) even though the request is technically coming from Nginx now.

&#x20;

\### 4. DNS: added the missing `www` record

&#x20;

Certbot initially failed to issue a certificate for `www.zoltanbiro.ca` because no DNS `A` record existed for that subdomain — only the bare domain resolved. An `A` record for `www` was added at the DNS provider, pointing at the same VM IP address as the bare domain. Once that propagated, both domains could be verified together.

&#x20;

\### 5. Issued the TLS certificate with Certbot

&#x20;

Certbot's Nginx plugin was used to request a certificate covering both `zoltanbiro.ca` and `www.zoltanbiro.ca`. Certbot:

\- Proved domain ownership using the HTTP-01 challenge (a temporary file served over port 80, checked by Let's Encrypt's servers)

\- Obtained and stored the certificate and private key under `/etc/letsencrypt/live/zoltanbiro.ca/`

\- \*\*Automatically edited the Nginx config\*\* to add a new server block listening on port 443 with TLS enabled, referencing the new cert

\- Added a redirect from the existing port 80 block to HTTPS

\### 6. Verified the full path end-to-end

&#x20;

\- `http://zoltanbiro.ca` → returns a `301` redirect to HTTPS (confirmed)

\- `https://zoltanbiro.ca` → terminates TLS in Nginx, proxies to Express (confirmed working once the Express app was running)

\- A `502 Bad Gateway` was seen briefly — this indicated Nginx and TLS were both working correctly, but the upstream Express app wasn't running at that moment. Once the app was started, requests succeeded.

\### 7. Auto-renewal

&#x20;

Let's Encrypt certificates are valid for 90 days. Certbot installs a systemd timer (`certbot.timer`) that automatically checks for and renews certificates nearing expiry, with no manual steps required going forward.

&#x20;

\## How the Pieces Connect

&#x20;

```

Browser

&#x20;  │

&#x20;  │  HTTPS request to zoltanbiro.ca (port 443)

&#x20;  ▼

Nginx (reverse proxy + TLS termination)

&#x20;  │  - Decrypts the HTTPS request using the Let's Encrypt cert

&#x20;  │  - Reads the plain HTTP request underneath

&#x20;  │  - Forwards it internally over plain HTTP

&#x20;  ▼

Express app (port 8080, localhost only)

&#x20;  │  - Handles routing/business logic as normal

&#x20;  │  - Has no awareness of TLS — it only ever sees plain HTTP

&#x20;  ▼

Response flows back through Nginx, which re-encrypts it

&#x20;  before sending it back to the browser over HTTPS

```

&#x20;

Key points about this architecture:

&#x20;

\- \*\*Nginx is the only thing exposed to the internet on 80/443.\*\* Express listens only on `127.0.0.1:8080`, meaning it's not directly reachable from outside the VM — only Nginx can talk to it. This is a meaningful security improvement over the old setup.

\- \*\*TLS termination happens once, at Nginx.\*\* Express never needs certificate files, TLS logic, or HTTPS-specific code. This keeps the application layer simple and means certificate renewal/rotation never requires touching or restarting the Express app.

\- \*\*The proxy is transparent to the client.\*\* From the browser's perspective, it's talking to `https://zoltanbiro.ca` — there's no visible sign that a second internal hop to Express is happening.

\- \*\*Headers preserve original request context.\*\* Nginx passes along headers like `X-Forwarded-For` and `X-Forwarded-Proto` so Express can still determine the real client IP and whether the original request was HTTP or HTTPS, if that ever matters for logging or logic.

\## Operational Notes for the Future

&#x20;

\- \*\*Restarting Nginx:\*\* use `sudo nginx -s reload` (or `sudo service nginx reload`) rather than `sudo systemctl reload nginx` — the latter triggered an unexpected polkit authentication prompt in this environment.

\- \*\*If HTTPS ever returns a 502:\*\* this almost always means Nginx/TLS are fine and the Express app itself isn't running or isn't listening on 8080. Check with `curl -I http://127.0.0.1:8080` and `pm2 status` before touching the Nginx config.

\- \*\*Certificate renewal:\*\* should be automatic via `certbot.timer`, but `sudo certbot renew --dry-run` can be used at any time to confirm renewal will succeed.

\- \*\*Adding future subdomains:\*\* any new subdomain will need its own DNS `A` record before Certbot can issue or expand a certificate to cover it, as was the case with `www` here.

\## Current State

&#x20;

\- HTTPS is live and verified for `zoltanbiro.ca` and `www.zoltanbiro.ca`

\- HTTP automatically redirects to HTTPS

\- Express app runs privately behind Nginx on port 8080

\- Certificate auto-renewal is configured

&#x20;


# Incident: system failed to automatically renew its own SSL certificate

Date: 2024-03-14

## Investigation

I logged into the production server and inspected the state of the letsencrypt
configuration:

    root@fenrir:~# ls -lahd /etc/letsencrypt/live/*
    -rw-r--r-- 1 root root  740 Dec 21 14:54 /etc/letsencrypt/live/README
    drwxr-xr-x 2 root root 4.0K Dec 20 19:08 /etc/letsencrypt/live/aria-at.w3.org
    drwxr-xr-x 2 root root 4.0K Jan 17 15:00 /etc/letsencrypt/live/fenrir.w3.org

    root@fenrir:~# ls -lah /etc/letsencrypt/renewal
    total 12K
    drwxr-xr-x 2 root root 4.0K Mar 14 18:12 .
    drwxr-xr-x 9 root root 4.0K Mar 14 18:11 ..
    -rw-r--r-- 1 root root  642 Jan 17 15:00 fenrir.w3.org.conf

    root@fenrir:~# cat /etc/letsencrypt/renewal/fenrir.w3.org.conf 
    # renew_before_expiry = 30 days
    version = 2.1.0
    archive_dir = /etc/letsencrypt/archive/fenrir.w3.org
    cert = /etc/letsencrypt/live/fenrir.w3.org/cert.pem
    privkey = /etc/letsencrypt/live/fenrir.w3.org/privkey.pem
    chain = /etc/letsencrypt/live/fenrir.w3.org/chain.pem
    fullchain = /etc/letsencrypt/live/fenrir.w3.org/fullchain.pem
    
    # Options used in the renewal process
    [renewalparams]
    account = 2f78412c8bc4d4fa3fceb538784540ab
    authenticator = webroot
    webroot_path = /home/aria-bot,
    server = https://acme-v02.api.letsencrypt.org/directory
    key_type = ecdsa
    renew_hook = /bin/systemctl restart nginx
    [[webroot_map]]
    fenrir.w3.org = /home/aria-bot

    root@fenrir:~# certbot certificates
    Saving debug log to /var/log/letsencrypt/letsencrypt.log
    
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    Found the following certs:
      Certificate Name: fenrir.w3.org
        Serial Number: 41d1c06172e401e2f24b99bd61657f33e6d
        Key Type: ECDSA
        Domains: fenrir.w3.org
        Expiry Date: 2024-04-16 13:59:57+00:00 (VALID: 32 days)
        Certificate Path: /etc/letsencrypt/live/fenrir.w3.org/fullchain.pem
        Private Key Path: /etc/letsencrypt/live/fenrir.w3.org/privkey.pem
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

This was suspicious because "fenrir.w3.org" is an internal name; it's useless
to the outside world (including the letsencrypt servers). However, it's the
*only* name that's been used by Certbot recently:

    root@fenrir:~# grep fenrir /var/log/letsencrypt/letsencrypt.log | wc -l
    121
    root@fenrir:~# grep aria-at /var/log/letsencrypt/letsencrypt.log | wc -l
    0

The provisioning script for Certbot only runs when the keys are not
present--from `deploy/roles/certbot/tasks/main.yml`:

    - name: Initialize certbot
      become: yes
      command: >
        certbot certonly
          --webroot
          --agree-tos
          --non-interactive
          --email {{letsencrypt_email}}
          --webroot-path /home/{{application_user}}
          --domain {{fqdn}}
      when: cert_file.stat.exists == false

The idea behind that design is to use the absence of the file as an indication
that the current machine has not yet been configured with the details for
ARIA-AT App.

We recently switched to a new production server, so one possible explanation
for our current predicament is that the keys from the old server were copied
over to the new one. That would allow the server to run immediately, but it
would also prevent our provisioning script from ever actually configuring
Certbot. The dates certainly corroborate that theory--the offending directory
was created on 2023-12-20, and we switched to the new server on 2023-12-21.

## Resolution

Before changing anything, I backed up the relevant files in case something went
wrong:

    root@fenrir:~# mkdir letsencrypt-tmp-2024-03-14
    root@fenrir:~# cp -rp /etc/letsencrypt/live /etc/letsencrypt/renewal letsencrypt-tmp-2024-03-14/

I used certbot's "remove" subcommand to remove the "fenrir" key because that
was certainly not helping anyone:

    root@fenrir:~# certbot delete --cert-name fenrir.w3.org
    Saving debug log to /var/log/letsencrypt/letsencrypt.log
    
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    The following certificate(s) are selected for deletion:
    
      * fenrir.w3.org
    
    WARNING: Before continuing, ensure that the listed certificates are not being
    used by any installed server software (e.g. Apache, nginx, mail servers).
    Deleting a certificate that is still being used will cause the server software
    to stop working. See https://certbot.org/deleting-certs for information on
    deleting certificates safely.
    
    Are you sure you want to delete the above certificate(s)?
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    (Y)es/(N)o: y
    Deleted all files relating to certificate fenrir.w3.org.

    root@fenrir:~# certbot certificates                                                                       
    Saving debug log to /var/log/letsencrypt/letsencrypt.log
    
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    No certificates found.
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

I also used the "remove" subcommand to completely expunge the existing
configuration for aria-at.w3.org (I suspect this was just the directory in
"live", but the Certbot maintainers are adamant that end users don't modify
files directly, so I let it do its job):

    root@fenrir:~# certbot delete --cert-name aria-at.w3.org
    Saving debug log to /var/log/letsencrypt/letsencrypt.log
    
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    The following certificate(s) are selected for deletion:
    
      * aria-at.w3.org
    
    WARNING: Before continuing, ensure that the listed certificates are not being
    used by any installed server software (e.g. Apache, nginx, mail servers).
    Deleting a certificate that is still being used will cause the server software
    to stop working. See https://certbot.org/deleting-certs for information on
    deleting certificates safely.
    
    Are you sure you want to delete the above certificate(s)?
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    (Y)es/(N)o: y
    No certificate found with name aria-at.w3.org (expected /etc/letsencrypt/renewal/aria-at.w3.org.conf).
    Ask for help or search for solutions at https://community.letsencrypt.org. See the logfile /var/log/letsencrypt/letsencrypt.log or re-run Certbot with -v for more details.

I then manually executed the command which is intended to be run when initially
provisioning the machine (as per the file
`deploy/roles/certbot/tasks/main.yml`):

    root@fenrir:~# certbot certonly --webroot --agree-tos --non-interactive --email infrastructure@bocoup.com --webroot-path /home/aria-bot --domain aria-at.w3.org
    Saving debug log to /var/log/letsencrypt/letsencrypt.log
    Requesting a certificate for aria-at.w3.org
    live directory exists for aria-at.w3.org
    Ask for help or search for solutions at https://community.letsencrypt.org. See the logfile /var/log/letsencrypt/letsencrypt.log or re-run Certbot with -v for more details.

And finally restarted the nginx service so that it would load the new
certificate:

    root@fenrir:~# /bin/systemctl restart nginx

And the server is now using a certificate which was issued today and which
expires in 90 days. Because we know Certbot has been checking for renewal on a
regular basis, I believe that it will automatically update in 60 days from
today, but it's worth keeping an eye on. That means checking the logs some time
next week, and also verifying that the renewal occurred as intended in 2
months.

+++
author = 'Alberto Trigo'
title = "Hosting websites"
draft = false
importance = 2
stage = 'draft'
date = 2024-04-26
updated = 2024-05-06
[taxonomies]
tags=["websites"]
[extra]
status = 'seed'
+++

A few days ago I decided to learn how to self-host multiple services (calibre, quartz, etc) on my own server. This lead me through a bit of a rabbithole and mutiple conversations with LLMs, which were of great help. After that, I decided to write this post to remind myself in case I need to do it in the future.

# Utilities

The main utilities that I used to accomplish the task were **Vultr** for a virtual machine, **DreamHost** for domain names and **nginx** for serving the files.


## Vultr

I am using one of the cheapest options. The machine has 25GB of internal storage, 1 vCPU and 1024MB of RAM. The monthly cost is 6$, which I consider to be a fair price. I might decide to buy a Raspberry Pi in the future, which may achieve similar results for a lower long-term cost.

This machine will be were the files are stored. The main tool to connect from your host machine is using the **ssh** protocol.

## Dreamhost

I got the *wiki* domain name for 2$/year. It costs more to renew it for another year, so I will decide when the time comes what to do with it.

I am using subdomains (eg. subdomain.maindomain.org), so I needed to create new "A records" for each subdomain. Yes, I should also add the ipv6 addresses for the subdomains.

![picture of dreamhost](/dreamhost.png)

## Nginx

After building the website into the `public/` folder of my project, I moved the content of that folder into the host machine folder `/var/www/mysite`. Next, I created a file in `/etc/nginx/sites-available/your-domain.conf`. Inside that file I put the following contents.
```nginx
server {
    listen 80;
    server_name your-domain.com; 
    root /var/www/mysite;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```
Then, I created a soft-link:
```bash
sudo ln -s /etc/nginx/sites-available/your-domain.conf /etc/nginx/sites-enabled/
```
Started nginx as a systemd service:
```bash
sudo systemctl enable nginx.service
```
Checked my nginx configuation:

```bash
sudo nginx -t
```
And restarted nginx:
```bash
sudo systemctl restart nginx
```

To enable the https protocol I installed certbot and run it
```bash
sudo apt install certbot python3-certbot-nginx 
sudo certbot --nginx -d your-domain.com
```

**Note**: To log into the virtual machine you need to use SSH:

```bash
ssh username@server_ip_address
```

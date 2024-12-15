+++
title = "Using an Android device as a webcam"
date = 2024-12-15
draft = false
description = "On linux, using scrcpy"
+++

Configure your system to use your Android phone as a webcam using `scrcpy` with a virtual video device `/dev/video10` that persists across reboots. 

## Prerequisites

### 1. Install Required Software
Ensure the following packages are installed:
- **scrcpy**: For Android screen mirroring and video streaming.
- **v4l2loopback-dkms**: To create a virtual video device.
- **ffmpeg**: For processing video streams.

### 2. Enable USB Debugging on Android
- Go to **Settings** → **About Phone** → Tap "Build Number" seven times to enable Developer Options.
- In **Developer Options**, enable **USB Debugging**.

### 3. Connect Your Android Phone
Use a USB cable to connect your Android device to your computer.

---

## Step 1: Configure `v4l2loopback`

### 1.1. Create a Configuration File
Create a file to define `v4l2loopback` options:
```bash
sudoedit /etc/modprobe.d/v4l2loopback.conf
```

Add the following:
```
options v4l2loopback devices=1 video_nr=10 card_label="Android Webcam" exclusive_caps=1
```

### 1.2. Create a Systemd Service
Ensure the kernel module is loaded at boot:
```bash
sudoedit /etc/systemd/system/v4l2loopback.service
```

Add the following:
```ini
[Unit]
Description=Load v4l2loopback kernel module
After=systemd-modules-load.service
Before=graphical.target

[Service]
Type=oneshot
ExecStart=/usr/bin/modprobe v4l2loopback
ExecStartPost=/usr/bin/udevadm settle
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

Enable the service:
```bash
sudo systemctl enable v4l2loopback.service
```

---

## Step 2: Integrate with Dracut

### 2.1. Add `v4l2loopback` to Dracut Configuration
Create a configuration file for dracut:
```bash
sudoedit /etc/dracut.conf.d/v4l2loopback.conf
```

Add the following:
```
add_drivers+="v4l2loopback"
```

### 2.2. Regenerate the Initramfs
Rebuild the initramfs:
```bash
sudo dracut --force
```

---

## Step 3: Test the Configuration

Reboot your system:
```bash
sudo reboot
```

After rebooting, confirm `/dev/video10` exists:
```bash
ls /dev/video10
```

If it exists, the configuration is successful. If not, check:
- The systemd service status: `sudo systemctl status v4l2loopback.service`
- Kernel logs: `sudo dmesg | grep v4l2loopback`

---

## Step 4: Run `scrcpy` to Use Android as a Webcam

Use the following command to start streaming your Android device’s camera to `/dev/video10`:
```bash
scrcpy --video-source=camera --camera-ar=1:1 --no-audio --video-codec=h264 --capture-orientation=0 --v4l2-sink=/dev/video10
```

### Command Breakdown:
- `--video-source=camera`: Uses the phone's camera as the video source.
- `--camera-ar=1:1`: Sets the aspect ratio to 1:1.
- `--no-audio`: Disables audio streaming.
- `--video-codec=h264`: Uses the H.264 codec for video encoding.
- `--capture-orientation=0`: Disables orientation-based adjustments.
- `--v4l2-sink=/dev/video10`: Streams the video output to `/dev/video10`.

---

## Troubleshooting
1. **Device Not Created**:
   - Verify the kernel module is loaded: `sudo lsmod | grep v4l2loopback`
   - Check logs: `sudo dmesg | grep v4l2loopback`

2. **Access Denied**:
   Ensure your user has permission to access video devices:
   ```bash
   sudo usermod -aG video $USER
   ```

3. **Poor Performance**:
   Adjust `scrcpy` options, such as `--bit-rate` or resolution, to optimize performance.


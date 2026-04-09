# Attribution and Rev Share

Every user signup through the before embed widget is attributed to the partner platform. This data enables revenue share conversations based on actual user acquisition.

## How attribution works

1. The embed widget detects your platform from the hostname (e.g., `matchr.xyz` becomes `matchr`)
2. When a user signs up from the widget on your site, the platform identifier is passed as a `ref` parameter
3. The `ref` is stored in the user's record in the before database as `ref_platform`
4. You can also set a custom identifier with `data-b4e-platform="your-name"` on the script tag

## What gets tracked

| Data Point | How It's Captured |
|---|---|
| **Platform name** | Auto-detected from hostname, or set via `data-b4e-platform` |
| **User email** | Captured when user signs up in the widget |
| **User tier** | Tracked when user upgrades (Lite or Pro) |
| **Signup date** | Timestamp of account creation |

## The Chrome extension also tracks attribution

When the before Chrome extension injects a widget on your platform, it passes the platform name through the same `ref` parameter. So even users who find before through the extension (rather than your embed) are attributed if they first saw the brief on your site.

## Rev share model

Attribution data is the foundation for rev share discussions. Typical arrangements:

- **Percentage of subscription revenue** from users attributed to your platform
- **Negotiated on a per-partner basis** based on volume and integration depth
- **Transparent reporting** - we can share attribution data with you

## For partners

To discuss a rev share arrangement, reach out on X at [@b4e](https://x.com/b4e).

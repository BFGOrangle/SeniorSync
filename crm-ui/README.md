This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your email configuration for the vendor application system:

```bash
# Email Configuration (required for vendor applications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**For Gmail Setup:**
1. Enable 2-factor authentication on your Google account
2. Go to Google Account Settings > Security > 2-Step Verification > App passwords
3. Generate an app password for "Mail"
4. Use the generated app password (not your regular password) in `EMAIL_PASS`

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

### Vendor Landing Page
- Professional landing page for prospective vendors at `/`
- Vendor application form at `/vendor-application`
- Automatic email notifications to `feiyue@seniorsync.fun` for new applications
- Confirmation emails sent to applicants

### Authentication
- Existing staff/admin login system at `/login`
- Role-based dashboard redirection

## Project Structure

- `/` - Vendor landing page
- `/vendor-application` - Vendor application form
- `/login` - Staff/Admin login
- `/dashboard` - Role-based dashboard redirect
- `/api/vendor-application` - Email API endpoint

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

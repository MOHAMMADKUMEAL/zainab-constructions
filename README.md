# Project Companion

Build a modern Construction Project Management web application for personal use.

The application should be simple, responsive, and easy to use. Do not build a large ERP system. Focus on managing projects, expenses, and client payments.

Use:

- React

- TypeScript

- Tailwind CSS

- Supabase for database and authentication

- Clean component architecture

- Responsive design

- Light and Dark mode

- Professional dashboard UI

====================================

AUTHENTICATION

====================================

Create a simple login page using Supabase Authentication.

Only authenticated users can access the application.

====================================

DASHBOARD

====================================

After login, display a dashboard containing summary cards.

Cards:

• Total Projects

• Active Projects

• Total Budget

• Total Expenses

• Total Payments Received

• Remaining Balance

Below the cards display:

- Recent Expenses

- Recent Payments

- Quick Action buttons

    - Add Project

    - Add Expense

    - Add Payment

====================================

PROJECT MANAGEMENT

====================================

Create a Projects page.

Display all projects in responsive cards.

Each card should display:

Project Name

Client Name

Phone Number

Location

Status

Budget

Expenses

Payments Received

Status options:

Planning

Running

Completed

On Hold

Add Project form fields:

Project Name

Client Name

Phone Number

Location

Budget

Start Date

Status

Notes

Allow:

Create Project

Edit Project

Delete Project

Search Projects

Clicking a project opens its details page.

====================================

PROJECT DETAILS PAGE

====================================

Each project has its own page.

Display:

Project Information

Budget

Total Expenses

Payments Received

Remaining Balance

Tabs:

Overview

Expenses

Payments

Notes

====================================

EXPENSE MANAGEMENT

====================================

Each expense belongs to a project.

Expense fields:

Project

Category

Description

Amount

Expense Date

Categories:

Material

Labour

Plumber

Electrician

Painter

Tiles

Transport

Other

Allow:

Create Expense

Edit Expense

Delete Expense

Search Expenses

Filter by category

Filter by date

Automatically calculate total project expenses.

====================================

PAYMENT MANAGEMENT

====================================

Each payment belongs to a project.

Fields:

Project

Amount

Payment Date

Payment Method

Payment methods:

Cash

UPI

Bank Transfer

Cheque

Notes

Allow:

Create Payment

Edit Payment

Delete Payment

Automatically calculate:

Total Received

Remaining Balance

====================================

NOTES

====================================

Each project should have simple notes.

Allow adding text notes.

Sort newest first.

====================================

SEARCH

====================================

Global search for:

Projects

Clients

Expenses

====================================

DATABASE

====================================

Create Supabase tables.

Projects

id

project_name

client_name

phone

location

budget

start_date

status

notes

created_at

Expenses

id

project_id

category

description

amount

expense_date

created_at

Payments

id

project_id

amount

payment_method

payment_date

notes

created_at

Create relationships using foreign keys.

====================================

UI DESIGN

====================================

Use a clean modern dashboard.

Use rounded cards.

Minimal color palette.

Professional typography.

Responsive sidebar.

Top navigation.

Use icons throughout.

Display money in Indian Rupees (₹).

Include loading states, empty states, confirmation dialogs for delete actions, and toast notifications.

====================================

EXTRA

====================================

Display charts on the dashboard:

Monthly Expenses

Monthly Payments

Project-wise Expenses

Use reusable components.

Follow best coding practices.

Keep the code modular and easy to extend.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://zainab-constructions.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/49af5d2a-eae6-4948-ac9d-3f6000421bc9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

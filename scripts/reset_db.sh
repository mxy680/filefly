# Navigate to the server folder
cd ../apps/server || exit

# Run Prisma command to reset the database
pnpx prisma migrate reset --force --skip-seed

# Check if GOOGLE_APPLICATION_CREDENTIALS is set
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set."
    echo "Please set it to the path of your service account JSON file."
    exit 1
fi

# Generate an access token
TOKEN=$(gcloud auth application-default print-access-token)

if [ $? -ne 0 ]; then
    echo "Error: Failed to generate access token. Make sure you are logged in with gcloud."
    exit 1
fi

echo "Your access token:"
echo "$TOKEN"

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory storage for tokens
tokens = {}

# Models
class TokenResponse(BaseModel):
    token: str
    expires_at: datetime


class TokenValidationResponse(BaseModel):
    valid: bool
    expires_at: datetime | None


def validate_token(token: str) -> dict:
    token_data = tokens.get(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if token_data["expires_at"] < datetime.utcnow():
        del tokens[token]  # Remove expired token
        raise HTTPException(status_code=401, detail="Token has expired")
    return token_data


@router.get("/validate", response_model=TokenValidationResponse)
async def validate_api_token(request: Request):
    """
    Validate an API token.
    """
    token = request.headers.get("Authorization")
    if not token:
        return {"valid": False, "expires_at": None}
    try:
        token_data = validate_token(token)
        return {"valid": True, "expires_at": token_data["expires_at"]}
    except HTTPException:
        return {"valid": False, "expires_at": None}

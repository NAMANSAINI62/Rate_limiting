from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: dict

class TokenPayload(BaseModel):
    sub: str
    role: str
    exp: int
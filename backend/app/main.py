from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

from app.api import auth, users

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, description='A learning project demonstrating API Rate Limiting.', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'], 
    allow_credentials=True, 
    allow_methods=['*'], 
    allow_headers=['*']
)

app.include_router(auth.router)
app.include_router(users.router)

@app.get('/health', tags=['System'])
async def health_check():
    return {'status': 'healthy', 'app': settings.APP_NAME, 'version': settings.APP_VERSION, 'debug': settings.DEBUG}

@app.get('/', tags=['System'])
async def root():
    return {'message': f'Welcome to {settings.APP_NAME}', 'docs': 'http://localhost:8000/docs', 'health': 'http://localhost:8000/health'}
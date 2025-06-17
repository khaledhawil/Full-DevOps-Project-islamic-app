# Ultra-minimal Python backend
FROM python:3.11-alpine

# Environment variables for optimization
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_ENV=production \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install everything in one layer to minimize image size  //
RUN apk add --no-cache --virtual .build-deps \
    gcc \
    musl-dev \
    postgresql-dev \
    && apk add --no-cache \
    libpq \
    curl \
    && pip install --no-cache-dir \
    gunicorn \
    psycopg2-binary \
    Flask==2.3.3 \
    Flask-CORS==4.0.0 \
    Flask-JWT-Extended==4.5.3 \
    Flask-SQLAlchemy==3.0.5 \
    Flask-Migrate==4.0.5 \
    marshmallow \
    flask-marshmallow \
    marshmallow-sqlalchemy \
    python-dotenv \
    python-dateutil \
    && apk del .build-deps \
    && rm -rf /var/cache/apk/* \
    && rm -rf /root/.cache \
    && mkdir logs

# Copy only essential files
COPY app.py database.py ./
COPY models/ ./models/
COPY routes/ ./routes/

EXPOSE 5000

HEALTHCHECK --interval=60s --timeout=5s --start-period=30s --retries=2 \
    CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "app:app"]

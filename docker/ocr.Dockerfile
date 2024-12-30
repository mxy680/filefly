FROM python:3.8-slim

ARG service_home="/home/EasyOCR"
ARG language_models="['en']"

# 1. Install system libs
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
      git \
      build-essential \
      libglib2.0-0 \
      libsm6 \
      libxext6 \
      libxrender-dev \
      libgl1-mesa-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Install newer PyTorch 2.0+ CPU wheels
RUN pip install --no-cache-dir \
    torch==2.0.1 \
    torchvision==0.15.2 \
    --extra-index-url https://download.pytorch.org/whl/cpu

# 3. Clone & build the latest EasyOCR from Git
RUN mkdir "$service_home" \
    && git clone "https://github.com/JaidedAI/EasyOCR.git" "$service_home" \
    && cd "$service_home" \
    && git pull origin master

RUN cd "$service_home" \
    && python setup.py build_ext --inplace -j 4 \
    && python -m pip install -e .

# 4. Add your FastAPI app
WORKDIR /app
COPY main.py /app/

RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    pillow \
    python-multipart

# 5. (Optional) Pre-download model
RUN python -c "import easyocr; reader = easyocr.Reader(${language_models}, gpu=False)"

EXPOSE 9000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9000"]

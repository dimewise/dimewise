FROM python:3.12

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

COPY .env /code/.env

WORKDIR app

EXPOSE 8000

CMD ["uvicorn", "main:app"]

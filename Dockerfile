FROM launcher.gcr.io/google/nodejs

# Copy application code.
COPY . /app/

# Install dependencies.
RUN npm --unsafe-perm install
EXPOSE 3000

CMD [ "npm", "start" ]

FROM gcr.io/google_appengine/nodejs

# Copy application code.
COPY . /app/

# Install dependencies.
RUN npm --unsafe-perm install

# Start
CMD npm start

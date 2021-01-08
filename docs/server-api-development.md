# Pull Swagger Containers
```
docker pull swaggerapi/swagger-editor
docker pull swaggerapi/swagger-ui
```

# Run Swagger Editor
```
docker run -p 3100:8080 -d swaggerapi/swagger-editor
```
Swagger editor will be available at http://localhost:3100. Import the `swagger.json` file by going to **File -> Import file**

## Making changes to **swagger.json**
Make necessary changes in the Swagger Editor. When finished, download the swagger file by going to **File -> Convert and save as JSON**. Move the file into the `/swagger` folder and commit the change.

# Run Swagger UI
```
docker run -p 3200:8080 -d -e URL=./foo/swagger.json -v $(pwd)/server/swagger:/usr/share/nginx/html/foo swaggerapi/swagger-ui
```
Swagger UI will be available at http://localhost:3200
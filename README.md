# FilmDrop UI

## Summary

FilmDrop UI is a browser-based interface for displaying results from a STAC API.

## Deployment

### Environment Files

For local development, you should include an `.env.development` file with the proper configuration.

For production builds, you should include an `.env.production` file with the proper configuration.

```
REACT_APP_LOGO=[URL]
REACT_APP_DASHBOARD_LINK=[URL]
REACT_APP_ANALYZE_LINK=[URL]
REACT_APP_STAC_API_ENDPOINT=[URL Endpoint]
REACT_APP_DEFAULT_COLLECTION=[Collection Name]
REACT_APP_TILER_CONFIGURATION=[Endpoint]
REACT_APP_TILER_COLOR_FORMULAS=[{"collection":"landsat-c2-l2","assets":"red&assets=green&assets=blue"}]
REACT_APP_TILER_COLOR_FORMULAS=[{"collection":"landsat-c2-l2","color_formula":"Gamma+RGB+1.7+Saturation+1.7+Sigmoidal+RGB+15+0.35"}]
```

### Links

Static files are built with `npm run build` OR `npm run build:prod` then moved to overwrite files in existing S3 buckets.

## Scripts

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

### `npm start`

Runs the app for local dev: at [http://localhost:3000](http://localhost:3000)

This uses the env vars found in .env.development

### `npm start:prod`

This uses the env vars found in .env.production

Everything else is the same as `npm start`

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

This builds using the env vars found in .env.development

Builds the app for production to the `build` folder.

### `npm run build:prod`

This builds using the env vars found in .env.production

Still builds the app for production to the `build` folder.\
Everything else is the same as `npm run build`

### `npm run eject`

Standard usage of eject script if needed (**warning! can't go back**): [npm run eject](https://create-react-app.dev/docs/available-scripts/#npm-run-eject).

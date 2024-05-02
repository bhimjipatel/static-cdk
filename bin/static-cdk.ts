import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {StaticSiteStack} from '../lib/static-site.stack';
import {identifyResource} from '../lib/config-util';
import {CiCdStack} from '../lib/ci-cd.stack';
import {Fn} from 'aws-cdk-lib';

const accountId = '720620135416';
const region = 'us-east-1';

const app = new cdk.App();

// Create stack that sets up the static hosting of the site
const staticSiteResourcePrefix = 'cdk-web-static';
const STATIC_SITE_BUCKET_NAME_OUTPUT_ID = identifyResource(staticSiteResourcePrefix, 'bucket-name');
const STATIC_SITE_DISTRIBUTION_ID_OUTPUT_ID = identifyResource(staticSiteResourcePrefix, 'distribution-id');

new StaticSiteStack(app, identifyResource(staticSiteResourcePrefix, 'stack'), {
  env: {
    account: accountId,
    region: region,
  },
  resourcePrefix: staticSiteResourcePrefix,
  hostedZoneName: 'gler-app.click',
  domainName: 'gler-app.click',
  includeWWW: false,
  siteSourcePath: '../dist',
  staticSiteBucketNameOutputId: STATIC_SITE_BUCKET_NAME_OUTPUT_ID,
  staticSiteDistributionIdOutputId: STATIC_SITE_DISTRIBUTION_ID_OUTPUT_ID,
});

// Create stack that sets up the CI/CD pipeline for the static site
const ciCdResourcePrefix = 'cdk-web-cicd';
const staticSiteBucket = Fn.importValue(STATIC_SITE_BUCKET_NAME_OUTPUT_ID);
const staticSiteDistributionId = Fn.importValue(STATIC_SITE_DISTRIBUTION_ID_OUTPUT_ID);

new CiCdStack(app, identifyResource(ciCdResourcePrefix, 'stack'), {
  env: {
    account: accountId,
    region: region
  },
  resourcePrefix: ciCdResourcePrefix,
  distributionId: staticSiteDistributionId,
  bucket: staticSiteBucket,
  repo: 'static-cdk',
  repoOwner: 'bhimjipatel',
  repoBranch: 'master',
  githubTokenSecretId: '/static-cdk/cicd/github_token',
  buildAlertEmail: 'bhimjipatel@hotmail.com',
});

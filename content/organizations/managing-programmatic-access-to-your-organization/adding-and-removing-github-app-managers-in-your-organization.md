---
title: Adding and removing GitHub App managers in your organization
intro: 'Organization owners can grant or revoke access for a user to manage some or all of the {% data variables.product.prodname_github_apps %} owned by the organization.'
redirect_from:
  - /articles/adding-github-app-managers-in-your-organization
  - /github/setting-up-and-managing-organizations-and-teams/adding-github-app-managers-in-your-organization
  - /organizations/managing-access-to-your-organizations-apps/adding-github-app-managers-in-your-organization
  - /articles/removing-github-app-managers-from-your-organization
  - /github/setting-up-and-managing-organizations-and-teams/removing-github-app-managers-from-your-organization
  - /organizations/managing-access-to-your-organizations-apps/removing-github-app-managers-from-your-organization
  - /organizations/managing-programmatic-access-to-your-organization/adding-github-app-managers-in-your-organization
  - /organizations/managing-programmatic-access-to-your-organization/removing-github-app-managers-from-your-organization
versions:
  fpt: '*'
  ghes: '*'
  ghec: '*'
topics:
  - Organizations
  - Teams
  - GitHub Apps
shortTitle: GitHub App managers
---

## About {% data variables.product.prodname_github_app %} managers

{% data reusables.apps.github-app-managers %}

For more information about {% data variables.product.prodname_github_app %} manager permissions, see [AUTOTITLE](/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization#github-app-managers).

## Granting the ability to manage all {% data variables.product.prodname_github_apps %} owned by the organization

{%- ifversion org-app-manager-teams %}
To assign the App Manager organization role to a user or team, see [AUTOTITLE](/organizations/managing-peoples-access-to-your-organization-with-roles/using-organization-roles#assigning-an-organization-role).

Use the role assignments page to see who has been granted this and any other organization role. Organization owners can always manage {% data variables.product.prodname_github_apps %} and are not shown in this view.
{%- else %}
{% data reusables.profile.access_org %}
{% data reusables.profile.org_settings %}
{% data reusables.organizations.github-apps-settings-sidebar %}
1. At the bottom of the "Management" section, in the search field, type the username of the person you want to designate as a {% data variables.product.prodname_github_app %} manager in the organization, then click **Grant**.
{%- endif %}

## Granting the ability to manage an individual {% data variables.product.prodname_github_app %}

{% data reusables.profile.access_org %}
{% data reusables.profile.org_settings %}
{% data reusables.organizations.github-apps-settings-sidebar %}
1. Under "{% data variables.product.prodname_github_apps %}", click on the avatar of the app you'd like to add a {% data variables.product.prodname_github_app %} manager for.
{% data reusables.organizations.app-managers-settings-sidebar %}
1. At the bottom of the "App managers" section, in the search field, type the username of the person{%- ifversion org-app-manager-teams %} or team{%- endif %} you want to designate as a GitHub App manager for the app, then click **Grant**.

## Removing a {% data variables.product.prodname_github_app %} manager's permissions for the entire organization

{%- ifversion org-app-manager-teams %}
See [AUTOTITLE](/organizations/managing-peoples-access-to-your-organization-with-roles/using-organization-roles#deleting-an-organization-role-assignment) for directions on removing the App Manager role from a user or team.
{%- else %}
{% data reusables.profile.access_org %}
{% data reusables.profile.org_settings %}
{% data reusables.organizations.github-apps-settings-sidebar %}
1. Under "Management", next to the person you want to remove {% data variables.product.prodname_github_app %} manager permissions from, click **Revoke**.
{%- endif %}

## Removing managers from an individual {% data variables.product.prodname_github_app %}

{% data reusables.profile.access_org %}
{% data reusables.profile.org_settings %}
{% data reusables.organizations.github-apps-settings-sidebar %}
1. Under "{% data variables.product.prodname_github_apps %}", click on the avatar of the app you'd like to remove a {% data variables.product.prodname_github_app %} manager from.
{% data reusables.organizations.app-managers-settings-sidebar %}
1. Under "App managers", next to the person{%- ifversion org-app-manager-teams %} or team{%- endif %} you want to remove {% data variables.product.prodname_github_app %} manager permissions from, click **Revoke**.

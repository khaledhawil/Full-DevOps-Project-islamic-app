{{/*
Expand the name of the chart.
*/}}
{{- define "islamic-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "islamic-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "islamic-app.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "islamic-app.labels" -}}
helm.sh/chart: {{ include "islamic-app.chart" . }}
{{ include "islamic-app.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "islamic-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "islamic-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "islamic-app.backend.labels" -}}
{{ include "islamic-app.labels" . }}
app.kubernetes.io/component: backend
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "islamic-app.backend.selectorLabels" -}}
{{ include "islamic-app.selectorLabels" . }}
app.kubernetes.io/component: backend
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "islamic-app.frontend.labels" -}}
{{ include "islamic-app.labels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "islamic-app.frontend.selectorLabels" -}}
{{ include "islamic-app.selectorLabels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
PostgreSQL labels
*/}}
{{- define "islamic-app.postgresql.labels" -}}
{{ include "islamic-app.labels" . }}
app.kubernetes.io/component: database
{{- end }}

{{/*
PostgreSQL selector labels
*/}}
{{- define "islamic-app.postgresql.selectorLabels" -}}
{{ include "islamic-app.selectorLabels" . }}
app.kubernetes.io/component: database
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "islamic-app.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "islamic-app.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Database URL
*/}}
{{- define "islamic-app.databaseUrl" -}}
{{- printf "postgresql://%s:%s@%s-postgresql:5432/%s" .Values.postgresql.auth.postgresUser .Values.postgresql.auth.postgresPassword (include "islamic-app.fullname" .) .Values.postgresql.auth.postgresDatabase | b64enc }}
{{- end }}

{{/*
Namespace name
*/}}
{{- define "islamic-app.namespace" -}}
{{- if .Values.namespace.create }}
{{- .Values.namespace.name }}
{{- else }}
{{- .Release.Namespace }}
{{- end }}
{{- end }}

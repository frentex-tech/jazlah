#!/bin/sh
# A deploy never builds or runs the mock code (README «Builds»): Render runs this before
# the dashboard's build and start commands, and CI checks it (ci-dashboard.yml).
status=0
for name in DASHBOARD_TEST_BUILD DASHBOARD_API_MOCK; do
  eval "value=\${$name:-}"
  if [ -n "$value" ]; then
    echo "deploy-guard: $name is set; a deployed dashboard never uses the mocks. Delete it from the service's Environment page." >&2
    status=1
  fi
done
exit $status

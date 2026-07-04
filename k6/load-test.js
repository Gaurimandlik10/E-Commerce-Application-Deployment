import http from 'k6/http'
import { sleep, check, group } from 'k6'
import { Counter, Rate } from 'k6/metrics'

// Custom metrics
const orderSuccess = new Counter('order_success')
const orderFail = new Counter('order_fail')
const errorRate = new Rate('error_rate')

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // warm up
    { duration: '3m', target: 50 },   // normal load
    { duration: '2m', target: 100 },  // high load
    { duration: '2m', target: 200 },  // spike!
    { duration: '2m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed:   ['rate<0.01'],  // less than 1% errors
    error_rate:        ['rate<0.05'],  // less than 5% errors
  }
}

const BASE_URL = __ENV.BASE_URL || 'http://node-service.ecommerce.svc.cluster.local:3000'

export default function() {

  group('Products API', function() {
    const res = http.get(`${BASE_URL}/api/products`)

    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time OK': (r) => r.timings.duration < 500,
      'has products': (r) => JSON.parse(r.body).length > 0
    })

    errorRate.add(res.status !== 200)
  })

  sleep(0.5)

  group('Cart Operations', function() {
    const addRes = http.post(
      `${BASE_URL}/api/cart`,
      JSON.stringify({
        productId: '64a1b2c3d4e5f6789012345',
        name: 'Test Product',
        price: 99.99,
        quantity: 1
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

    check(addRes, {
      'cart add success': (r) => r.status === 201 || r.status === 200
    })

    errorRate.add(addRes.status !== 201 && addRes.status !== 200)
  })

  sleep(0.5)

  group('Health Check', function() {
    const healthRes = http.get(`${BASE_URL}/health`)

    check(healthRes, {
      'health OK': (r) => r.status === 200,
      'database connected': (r) => {
        const body = JSON.parse(r.body)
        return body.database === 'connected'
      }
    })
  })

  sleep(1)
}

export function handleSummary(data) {
  return {
    'k6-results.json': JSON.stringify(data),
    stdout: `
=== K6 LOAD TEST RESULTS ===
Total Requests: ${data.metrics.http_reqs.values.count}
Failed Requests: ${data.metrics.http_req_failed.values.passes}
Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
P95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
Error Rate: ${(data.metrics.error_rate.values.rate * 100).toFixed(2)}%
============================
    `
  }
}
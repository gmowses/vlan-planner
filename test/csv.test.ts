import assert from 'node:assert/strict'
import test from 'node:test'
import { vlanCsv } from '../src/csv.ts'

test('exports RFC 4180 escaped rows and neutralizes spreadsheet formulas', () => {
  const csv = vlanCsv([{ vlanId: '=42', name: 'Office, East', subnet: '10.0.0.0/24', description: 'A "quoted"\nline' }])
  assert.equal(csv, "VLAN ID,Name,Subnet,Description\r\n'=42,\"Office, East\",10.0.0.0/24,\"A \"\"quoted\"\"\nline\"")
})

test('keeps ordinary values unchanged', () => {
  assert.match(vlanCsv([{ vlanId: '10', name: 'Management', subnet: '192.168.1.0/24', description: 'Internal network' }]), /10,Management,192\.168\.1\.0\/24,Internal network/)
})

test('neutralizes formula prefixes in every exported field', () => {
  const csv = vlanCsv([{ vlanId: '+20', name: '@team', subnet: '-10.0.0.0/24', description: '=HYPERLINK("https://example.test")' }])
  assert.match(csv, /'\+20,'@team,'-10\.0\.0\.0\/24,"'=HYPERLINK\(""https:\/\/example\.test""\)"/)
})

test('neutralizes formulas after whitespace without changing ordinary whitespace', () => {
  const csv = vlanCsv([{ vlanId: '\t=1+1', name: '  =1+1', subnet: '  Internal', description: ' Network' }])
  assert.match(csv, /'\t=1\+1,' {2}=1\+1, {2}Internal, Network/)
})


#  Wallet Transaction API

A RESTful API for managing client wallets, transactions, and orders with **atomic balance handling** and **transaction history tracking**.

---

## ✨ What This API Does

* Manages client wallet balances (credit & debit)
* Prevents negative balances
* Creates orders with wallet deduction
* Logs every transaction in a ledger
* Ensures data consistency using database transactions
* Integrates with an external fulfillment API

---

## 🌐 API Endpoints

### 🔐 Admin Wallet Operations

#### Credit Wallet

**POST** `/admin/wallet/credit`

```json
{
  "client_id": 1,
  "amount": 500
}
```

**Response**

```json
{
  "success": true,
  "balance": 1500.50
}
```

---

#### Debit Wallet

**POST** `/admin/wallet/debit`

```json
{
  "client_id": 1,
  "amount": 200
}
```

**Response**

```json
{
  "success": true,
  "balance": 1300.50
}
```

**Error**

```json
{
  "success": false,
  "error": "Insufficient balance"
}
```

---

### 🛒 Orders

#### Create Order

**POST** `/orders`
**Header**: `client-id: 1`

```json
{
  "amount": 250
}
```

**Response**

```json
{
  "success": true,
  "order": {
    "id": 1,
    "amount": 250,
    "status": "COMPLETED",
    "fulfillment_id": "101"
  },
  "new_balance": 1050.50
}
```

---

#### Get Order Details

**GET** `/orders/:order_id`
**Header**: `client-id: 1`

```json
{
  "success": true,
  "order": {
    "id": 1,
    "amount": 250,
    "status": "COMPLETED",
    "fulfillment_id": "101"
  }
}
```

---

### 💼 Wallet

#### Get Wallet Balance

**GET** `/wallet/balance`
**Header**: `client-id: 1`

```json
{
  "success": true,
  "wallet": {
    "client_id": 1,
    "balance": 1050.50
  }
}
```

---

###  Health Check

**GET** `/health`

```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## ⚠️ Error Responses

| Scenario             | Code | Message               |
| -------------------- | ---- | --------------------- |
| Insufficient balance | 400  | Insufficient balance  |
| Client not found     | 404  | Client not found      |
| Order not found      | 404  | Order not found       |
| Invalid input        | 400  | Validation error      |
| Server error         | 500  | Internal server error |

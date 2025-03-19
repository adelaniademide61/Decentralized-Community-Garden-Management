;; Harvest Tracking Contract - Simplified
;; Records produce yields

(define-data-var admin principal tx-sender)

;; Crop types
(define-map crop-types
  { crop-id: uint }
  {
    name: (string-utf8 50),
    category: (string-utf8 50)
  }
)

;; Harvest records
(define-map harvests
  { harvest-id: uint }
  {
    plot-id: uint,
    crop-id: uint,
    gardener: principal,
    quantity: uint,
    harvest-date: uint
  }
)

(define-data-var next-crop-id uint u1)
(define-data-var next-harvest-id uint u1)

;; Add a new crop type (admin only)
(define-public (add-crop-type (name (string-utf8 50)) (category (string-utf8 50)))
  (let (
    (crop-id (var-get next-crop-id))
  )
    (asserts! (is-eq tx-sender (var-get admin)) (err u1))

    (map-set crop-types
      { crop-id: crop-id }
      {
        name: name,
        category: category
      }
    )

    (var-set next-crop-id (+ crop-id u1))
    (ok crop-id)
  )
)

;; Record a harvest
(define-public (record-harvest (plot-id uint) (crop-id uint) (quantity uint))
  (let (
    (harvest-id (var-get next-harvest-id))
  )
    ;; Verify crop exists
    (asserts! (is-some (map-get? crop-types { crop-id: crop-id })) (err u2))

    ;; Create harvest record
    (map-set harvests
      { harvest-id: harvest-id }
      {
        plot-id: plot-id,
        crop-id: crop-id,
        gardener: tx-sender,
        quantity: quantity,
        harvest-date: block-height
      }
    )

    ;; Increment harvest ID
    (var-set next-harvest-id (+ harvest-id u1))

    (ok harvest-id)
  )
)

;; Read-only functions
(define-read-only (get-crop-type (crop-id uint))
  (map-get? crop-types { crop-id: crop-id })
)

(define-read-only (get-harvest (harvest-id uint))
  (map-get? harvests { harvest-id: harvest-id })
)

(define-read-only (get-next-harvest-id)
  (var-get next-harvest-id)
)

(define-read-only (get-next-crop-id)
  (var-get next-crop-id)
)


;; Work Contribution Contract - Simplified
;; Monitors member participation in shared tasks

(define-data-var admin principal tx-sender)

;; Task definitions
(define-map tasks
  { task-id: uint }
  {
    name: (string-utf8 100),
    description: (string-utf8 200),
    points: uint,
    active: bool
  }
)

;; Work logs
(define-map work-logs
  { log-id: uint }
  {
    task-id: uint,
    worker: principal,
    hours: uint,
    date: uint,
    verified: bool
  }
)

;; Member contribution totals
(define-map member-contributions
  { member: principal }
  {
    total-hours: uint,
    total-points: uint
  }
)

(define-data-var next-task-id uint u1)
(define-data-var next-log-id uint u1)

;; Add a new task (admin only)
(define-public (add-task (name (string-utf8 100)) (description (string-utf8 200)) (points uint))
  (let (
    (task-id (var-get next-task-id))
  )
    (asserts! (is-eq tx-sender (var-get admin)) (err u1))

    (map-set tasks
      { task-id: task-id }
      {
        name: name,
        description: description,
        points: points,
        active: true
      }
    )

    (var-set next-task-id (+ task-id u1))
    (ok task-id)
  )
)

;; Log work contribution
(define-public (log-work (task-id uint) (hours uint))
  (let (
    (task (unwrap! (map-get? tasks { task-id: task-id }) (err u2)))
    (log-id (var-get next-log-id))
    (points (* hours (get points task)))
    (member-stats (default-to { total-hours: u0, total-points: u0 }
                  (map-get? member-contributions { member: tx-sender })))
  )
    (asserts! (get active task) (err u3))
    (asserts! (> hours u0) (err u4))

    ;; Create work log
    (map-set work-logs
      { log-id: log-id }
      {
        task-id: task-id,
        worker: tx-sender,
        hours: hours,
        date: block-height,
        verified: false
      }
    )

    ;; Update member contributions
    (map-set member-contributions
      { member: tx-sender }
      {
        total-hours: (+ (get total-hours member-stats) hours),
        total-points: (+ (get total-points member-stats) points)
      }
    )

    ;; Increment log ID
    (var-set next-log-id (+ log-id u1))

    (ok log-id)
  )
)

;; Verify work contribution (admin only)
(define-public (verify-work (log-id uint))
  (let (
    (work-log (unwrap! (map-get? work-logs { log-id: log-id }) (err u5)))
  )
    (asserts! (is-eq tx-sender (var-get admin)) (err u1))

    ;; Update work log
    (ok (map-set work-logs
      { log-id: log-id }
      (merge work-log { verified: true })
    ))
  )
)

;; Read-only functions
(define-read-only (get-task (task-id uint))
  (map-get? tasks { task-id: task-id })
)

(define-read-only (get-work-log (log-id uint))
  (map-get? work-logs { log-id: log-id })
)

(define-read-only (get-member-contributions (member principal))
  (map-get? member-contributions { member: member })
)


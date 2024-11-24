package main

import (
	"fmt"
	"net/http"
	"sync"
	"time"
)

type LockState struct {
	Owner      string
	TTL        int
	mu         sync.Mutex
	timer      *time.Timer
	updateChan chan LockState
}

func (l *LockState) AcquireLock(owner string, ttl int) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	if l.Owner != "" {
		return false
	}

	l.Owner = owner
	l.TTL 	= ttl
	l.startTTLTimer()
	return true
}

func (l *LockState) ReleaseLock(owner string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	if l.Owner != owner {
		return false // Only the owner can release
	}

	l.stopTTLTimer()
	l.Owner = ""
	l.TTL = 0
	return true
}

func (l *LockState) startTTLTimer() {
	l.timer = time.AfterFunc(time.Duration(l.TTL)*time.Second, func() {
		l.mu.Lock()
		defer l.mu.Unlock()
		l.Owner = ""
		l.TTL = 0
	})
}

func (l *LockState) stopTTLTimer() {
	if l.timer != nil {
		l.timer.Stop()
	}
}

func main() {
	lock := &LockState{
		updateChan: make(chan LockState),
	}

	mux := http.NewServeMux()

	mux.Handle("/", http.FileServer(http.Dir("./static")))

	mux.HandleFunc("/acquire", func(w http.ResponseWriter, r *http.Request) {
		owner := r.URL.Query().Get("owner")
		ttl := 5
		success := lock.AcquireLock(owner, ttl)
		if success {
			w.Write([]byte("Lock acquired"))
		} else {
			w.Write([]byte("Lock already held"))
		}
	})

	mux.HandleFunc("/release", func(w http.ResponseWriter, r *http.Request) {
		owner := r.URL.Query().Get("owner")
		success := lock.ReleaseLock(owner)
		if success {
			w.Write([]byte("Lock released"))
		} else {
			w.Write([]byte("Failed to release lock"))
		}
	})

	fmt.Println("Starting server on port: 8080")

	http.ListenAndServe(":8080", mux)
}

package main

import (
	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/internal/server"
)

func main() {
	c := config.NewConfig()
	s := server.NewServer(c)

	s.Start()
}

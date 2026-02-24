package main

import (
	"dimewise/internal/boot"
	"dimewise/internal/config"
)

func main() {
	c := config.NewConfig()
	s := boot.NewServer(c)

	s.Start()
}

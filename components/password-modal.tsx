"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PasswordModal({ isOpen, onClose, onSuccess }: PasswordModalProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "admin123") {
      localStorage.setItem('showAdvanced', 'true')
      toast.success("Advanced mode activated")
      onSuccess()
      onClose()
      setPassword("")
    } else {
      setError("Incorrect password")
      toast.error("Incorrect password")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1B2531] border-[#2a3744]">
        <DialogHeader>
          <DialogTitle className="text-[#40C4FF]">Enter Admin Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#2a3744] border-[#3a4754] text-white"
              placeholder="Enter admin password"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-white border-[#3a4754]"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#40C4FF] text-white hover:bg-blue-400">
              Unlock Advanced Mode
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
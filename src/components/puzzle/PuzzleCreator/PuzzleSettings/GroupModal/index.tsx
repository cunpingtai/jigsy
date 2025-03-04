import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as client from "@/services/client";
import { Category } from "@/services/types";
import { useI18n } from "@/app/[locale]/providers";

interface GroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (group: any) => void;
  categoryId?: number;
  categories: Category[];
  locale: string;
}

export const GroupModal: FC<GroupModalProps> = ({
  open,
  onClose,
  onCreated,
  categoryId,
  categories,
  locale,
}) => {
  const { data } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: categoryId?.toString() || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError(data.groupNameRequired);
      return;
    }

    if (!formData.categoryId) {
      setError(data.categoryRequired);
      return;
    }

    setLoading(true);
    try {
      const response = await client.groupService.createGroup({
        name: formData.name,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        language: locale,
      });

      if (response && response.id) {
        onCreated(response);
        setFormData({
          name: "",
          description: "",
          categoryId: categoryId?.toString() || "",
        });
      } else {
        setError(data.createGroupFailed);
      }
    } catch (err) {
      console.error("创建分组错误:", err);
      setError(data.createGroupFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{data.createGroup}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="group-category">{data.category}</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => handleChange("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={data.selectCategory} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-name">{data.groupName}</Label>
            <Input
              id="group-name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={data.groupNamePlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-description">{data.groupDescription}</Label>
            <Textarea
              id="group-description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={data.groupDescriptionPlaceholder}
              rows={3}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {data.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? data.creating : data.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

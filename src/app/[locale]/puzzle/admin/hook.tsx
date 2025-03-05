"use client";
import { Atom } from "@/services/types";
import { calculatePuzzleDifficulty, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useI18n } from "@/app/[locale]/providers";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as client from "@/services/client";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Edit, Eye, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Status = "ALL" | "DRAFT" | "PUBLISHED" | "DELETED";

export const AdminPage = ({
  locale,
  result,
  search,
  status,
}: {
  locale: string;
  search?: string;
  status?: Status;
  result: {
    data: Atom[];
    pagination: {
      page: number;
      totalPages: number;
    };
  };
}) => {
  const { data } = useI18n();
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [statusFilter, setStatusFilter] = useState(status || "ALL");

  const handleSearch = () => {
    window.location.href = `/${locale}/puzzle/admin?page=1&status=${statusFilter}&search=${encodeURIComponent(
      searchTerm
    )}`;
  };

  const handleStatusChange = (value: Status) => {
    setStatusFilter(value);
    window.location.href = `/${locale}/puzzle/admin?page=1&status=${value}&search=${encodeURIComponent(
      searchTerm
    )}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePublish = async (atom: Atom) => {
    try {
      await client.atomService.updateAtomStatus(
        atom.id,
        atom.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
      );

      toast.success("拼图已发布");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("发布失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个拼图吗？此操作不可撤销。")) {
      return;
    }

    try {
      await client.atomService.deleteAtomById(id);

      toast.success("拼图已删除");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const statusMap = {
    DRAFT: data.draft,
    PUBLISHED: data.published,
    DELETED: data.deleted,
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">{data.adminPuzzleList}</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder={data.searchPuzzles}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            {data.search}
          </Button>
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder={data.filterByStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{data.allStatus}</SelectItem>
              <SelectItem value="DRAFT">{data.draft}</SelectItem>
              <SelectItem value="PUBLISHED">{data.published}</SelectItem>
              <SelectItem value="DELETED">{data.deleted}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {result.data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">{data.noPuzzlesFound}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.data.map((atom) => {
              const pieces = atom.config
                ? atom.config?.tilesX * atom.config?.tilesY
                : 0;
              return (
                <Card key={atom.id} className="overflow-hidden">
                  {atom.coverImage && (
                    <div className="relative w-full h-40 overflow-hidden">
                      <Image
                        src={getImageUrl(atom.coverImage)}
                        alt={atom.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className={atom.coverImage ? "pt-4" : ""}>
                    <CardTitle className="line-clamp-2">{atom.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          atom.status === "PUBLISHED" ? "default" : "secondary"
                        }
                      >
                        {statusMap[atom.status as keyof typeof statusMap]}
                      </Badge>
                      <Badge variant="outline">
                        {calculatePuzzleDifficulty(
                          pieces,
                          atom.config?.type || "image",
                          data
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {atom.content || "无描述"}
                    </p>
                    <p className="text-sm mt-2">
                      {data.creator}: {atom.user?.name || "未知"}
                    </p>
                    <p className="text-sm">
                      {data.createdAt}:{" "}
                      {new Date(atom.createdAt).toLocaleString()}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Link href={`/${locale}/puzzle/${atom.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        {data.view}
                      </Button>
                    </Link>
                    <Link href={`/${locale}/puzzle/${atom.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        {data.edit}
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant={
                        atom.status === "PUBLISHED" ? "default" : "outline"
                      }
                      onClick={() => handlePublish(atom)}
                    >
                      {atom.status === "PUBLISHED"
                        ? data.published
                        : data.publish}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(atom.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {data.delete}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/puzzle/admin?page=${
                  result.pagination.page - 1
                }&status=${statusFilter}&search=${encodeURIComponent(
                  searchTerm
                )}`}
              >
                <Button
                  variant="outline"
                  disabled={result.pagination.page === 1}
                >
                  {data.previousPage}
                </Button>
              </Link>

              <span className="mx-4">
                {data.pageLabel
                  .replace("{page}", result.pagination.page.toString())
                  .replace(
                    "{totalPages}",
                    result.pagination.totalPages.toString()
                  )}
              </span>

              <Link
                href={`/${locale}/puzzle/admin?page=${
                  result.pagination.page + 1
                }&status=${statusFilter}&search=${encodeURIComponent(
                  searchTerm
                )}`}
              >
                <Button
                  variant="outline"
                  disabled={
                    result.pagination.page === result.pagination.totalPages
                  }
                >
                  {data.nextPage}
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPage;

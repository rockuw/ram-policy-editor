# ram-policy-editor

Visual RAM Policy Editor

## Usage

### Resources

Resources有如下几种格式：

1. 表示某个bucket: `my-bucket` （此时对bucket下的文件没有权限）
2. 表示某个bucket下面所有文件: `my-bucket/*` （此时对bucket本身没有权
   限，例如ListObjects）
3. 表示某个bucket下某个目录: `my-bucket/dir` （此时对dir/下面的文件没
   有权限）
4. 表示某个bucket下某个目录下面所有文件: `my-bucket/dir/*` （此时对dir
   没有权限，例如ListObjects）
5. 填写完整的资源路径：`acs:oss:*:1234:my-bucket/dir`，其中`1234`为用
   户的User ID（在控制台查看）

### EnablePath

当用户需要对某个目录授权时，往往还需要保证对上一层目录也有List权限，例
如用户对`my-bucket/users/dir/*`赋予读写权限，为了在控制台（或其他工具）
能够查看这个目录，用户还需要以下权限：

```
ListObjects my-bucket
ListObjects my-bucket/users
ListObjects my-bucket/users/dir
```

勾选EnablePath选项时，上面这些权限会自动添加。

# TODO

+ select/option for Effect/Action
* filtering action
* use react-select
+ add multiple resources
+ support deleting rule
+ nice looking
+ add condition editor
+ Rule list entry too long
+ add notice on error
+ add condition op list
+ auto set parent path as readonly
* condition multiple values
- load template
- syntax highlighting for json
